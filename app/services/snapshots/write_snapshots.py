from datetime import datetime, timezone
from typing import List

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models.events import Event
from app.db.models.markets import Market
from app.db.models.sports import Sport
from app.db.models.odds_snapshots import OddsSnapshot

from app.services.normalizers.odds_api_normalizer import NormalizedEvent


def _get_or_create_sport(db: Session, sport_key: str, sport_name: str) -> Sport:
    sport = db.query(Sport).filter(Sport.key == sport_key).one_or_none()
    if sport:
        return sport

    sport = Sport(key=sport_key, name=sport_name)
    db.add(sport)
    db.flush()
    return sport


def _get_or_create_event(db: Session, ne: NormalizedEvent) -> Event:
    event = (
        db.query(Event)
        .filter(Event.external_event_id == ne.provider_event_id)
        .one_or_none()
    )
    if event:
        return event

    sport = _get_or_create_sport(db, ne.sport_key, ne.sport_title)

    event = Event(
        sport_id=sport.id,
        start_time=ne.commence_time_utc,
        home_team=ne.home_team,
        away_team=ne.away_team,
        external_event_id=ne.provider_event_id,
    )
    db.add(event)
    db.flush()
    return event


def _get_or_create_market(
    db: Session,
    event_id,
    market_type: str,
    selection: str,
    line,
) -> Market:
    q = (
        db.query(Market)
        .filter(Market.event_id == event_id)
        .filter(Market.market_type == market_type)
        .filter(Market.selection == selection)
    )

    if line is None:
        q = q.filter(Market.line.is_(None))
    else:
        q = q.filter(Market.line == line)

    market = q.one_or_none()
    if market:
        return market

    market = Market(
        event_id=event_id,
        market_type=market_type,
        selection=selection,
        line=line,
    )
    db.add(market)
    db.flush()
    return market


def write_snapshots(
    normalized_events: List[NormalizedEvent],
    fetched_at_utc: datetime,
):
    db = SessionLocal()
    inserted = 0

    try:
        rows = []

        for ne in normalized_events:
            event = _get_or_create_event(db, ne)

            for book in ne.books:
                for market in book.markets:
                    for outcome in market.outcomes:
                        mkt = _get_or_create_market(
                            db=db,
                            event_id=event.id,
                            market_type=market.market_type,
                            selection=outcome.label,
                            line=outcome.point,
                        )

                        rows.append(
                            OddsSnapshot(
                                event_id=event.id,
                                market_id=mkt.id,
                                book_key=book.book_key,
                                book_title=book.book_title,
                                odds_decimal=outcome.price_decimal,
                                fetched_at=fetched_at_utc,
                                provider_last_update=book.last_update_utc,
                            )
                        )

        if rows:
            db.bulk_save_objects(rows)
            inserted = len(rows)

        db.commit()
        return {"inserted": inserted}

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
