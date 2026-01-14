from __future__ import annotations

import random
import asyncio
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple, List

import httpx


@dataclass(frozen=True)
class ProviderRequestMeta:
    provider: str
    url: str
    method: str
    params: Dict[str, Any]
    status_code: int
    fetched_at_utc: datetime
    duration_ms: int
    attempt_count: int
    response_headers: Dict[str, str]


class ProviderClientError(Exception):
    pass


class ProviderRateLimited(ProviderClientError):
    pass


class ProviderTransientError(ProviderClientError):
    pass


class ProviderBadResponse(ProviderClientError):
    pass


class ProviderClient:
    """
    Async provider connection client:
    - Adds API key auth
    - Builds requests
    - Retries on 429 + transient failures (timeouts, 5xx)
    - Returns raw JSON + request metadata
    """

    def __init__(
        self,
        *,
        provider_name: str,
        base_url: str,
        api_key: str,
        api_key_param: str = "apiKey",
        api_key_header: Optional[str] = None,
        timeout_s: float = 10.0,
        max_retries: int = 5,
        backoff_base_s: float = 0.75,
        backoff_max_s: float = 10.0,
        jitter: bool = True,
    ) -> None:
        self.provider_name = provider_name
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.api_key_param = api_key_param
        self.api_key_header = api_key_header

        self.timeout_s = timeout_s
        self.max_retries = max_retries
        self.backoff_base_s = backoff_base_s
        self.backoff_max_s = backoff_max_s
        self.jitter = jitter

        self._client: Optional[httpx.AsyncClient] = None

    async def aopen(self) -> None:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout_s),
                headers={"Accept": "application/json"},
            )

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    def _auth_headers_and_params(self, params: Dict[str, Any]) -> Tuple[Dict[str, str], Dict[str, Any]]:
        headers: Dict[str, str] = {}
        p = dict(params)

        if self.api_key_header:
            headers[self.api_key_header] = self.api_key
        else:
            p[self.api_key_param] = self.api_key

        return headers, p

    def _parse_retry_after_seconds(self, headers: httpx.Headers) -> Optional[float]:
        ra = headers.get("Retry-After")
        if not ra:
            return None
        try:
            return float(ra)
        except ValueError:
            return None

    async def _sleep_backoff(self, attempt: int, retry_after_s: Optional[float] = None) -> None:
        if retry_after_s is not None and retry_after_s > 0:
            sleep_s = min(retry_after_s, self.backoff_max_s)
        else:
            sleep_s = self.backoff_base_s * (2 ** max(0, attempt - 1))
            sleep_s = min(sleep_s, self.backoff_max_s)

        if self.jitter:
            sleep_s *= (0.85 + random.random() * 0.3)

        await asyncio.sleep(sleep_s)

    async def request_json(
        self,
        *,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        method: str = "GET",
    ) -> Tuple[Any, ProviderRequestMeta]:
        if self._client is None:
            raise RuntimeError("ProviderClient not initialized. Call await client.aopen() at startup.")

        url = f"{self.base_url}/{path.lstrip('/')}"
        params = params or {}
        headers, authed_params = self._auth_headers_and_params(params)

        for attempt in range(1, self.max_retries + 1):
            started = time.perf_counter()
            fetched_at = datetime.now(timezone.utc)

            try:
                resp = await self._client.request(
                    method=method.upper(),
                    url=url,
                    params=authed_params,
                    headers=headers,
                )
                duration_ms = int((time.perf_counter() - started) * 1000)

                meta = ProviderRequestMeta(
                    provider=self.provider_name,
                    url=str(resp.request.url),
                    method=method.upper(),
                    params=authed_params,
                    status_code=resp.status_code,
                    fetched_at_utc=fetched_at,
                    duration_ms=duration_ms,
                    attempt_count=attempt,
                    response_headers=dict(resp.headers),
                )

                if 200 <= resp.status_code < 300:
                    return resp.json(), meta

                if resp.status_code == 429:
                    if attempt == self.max_retries:
                        raise ProviderRateLimited(f"Rate limited (429) after {attempt} attempts")
                    retry_after = self._parse_retry_after_seconds(resp.headers)
                    await self._sleep_backoff(attempt, retry_after_s=retry_after)
                    continue

                if 500 <= resp.status_code < 600:
                    if attempt == self.max_retries:
                        raise ProviderTransientError(f"Provider 5xx after {attempt} attempts: {resp.status_code}")
                    await self._sleep_backoff(attempt)
                    continue

                raise ProviderBadResponse(f"Provider returned {resp.status_code}: {resp.text[:300]}")

            except (httpx.TimeoutException, httpx.NetworkError) as e:
                if attempt == self.max_retries:
                    raise ProviderTransientError(f"Network/timeout after {attempt} attempts") from e
                await self._sleep_backoff(attempt)
                continue

        raise ProviderClientError("Request failed after retries (unexpected)")

    async def fetch_odds(
        self,
        *,
        sport_key: str,
        regions: List[str],
        markets: List[str],
        odds_format: str = "decimal",
        date_format: str = "iso",
        commence_time_from: Optional[str] = None,
        commence_time_to: Optional[str] = None,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Any, ProviderRequestMeta]:
        params: Dict[str, Any] = {
            "regions": ",".join(regions),
            "markets": ",".join(markets),
            "oddsFormat": odds_format,
            "dateFormat": date_format,
        }
        if commence_time_from:
            params["commenceTimeFrom"] = commence_time_from
        if commence_time_to:
            params["commenceTimeTo"] = commence_time_to
        if extra_params:
            params.update(extra_params)

        path = f"v4/sports/{sport_key}/odds"
        return await self.request_json(path=path, params=params)
