from app.services.quote_solver import InputLeg, quote_arbitrage
from app.schemas.arbs_quote import QuoteConstraints

def test_quote_solver_balances_and_roi_positive():
    legs = [
        InputLeg(outcome="over", book="dk", odds_decimal=2.02, odds_american=102, line=228.5, ts_ingested_ms=0),
        InputLeg(outcome="under", book="fd", odds_decimal=2.05, odds_american=105, line=228.5, ts_ingested_ms=0),
    ]
    c = QuoteConstraints(bankroll=100.0, min_bet=1.0, bet_increment=0.01, max_bet=None)
    res = quote_arbitrage(arb_id="x", legs=legs, constraints=c, stale_cutoff_ms=300000, now_ms=0)
    assert res.ok is True
    assert res.roi_raw is not None and res.roi_raw > 0
    assert res.roi_effective is not None and res.roi_effective > 0
    total = round(sum(l.stake for l in res.legs), 2)
    assert total == 100.0

def test_infeasible_when_min_bets_exceed_bankroll():
    legs = [
        InputLeg(outcome="over", book="dk", odds_decimal=2.02, odds_american=102, line=228.5, ts_ingested_ms=0),
        InputLeg(outcome="under", book="fd", odds_decimal=2.05, odds_american=105, line=228.5, ts_ingested_ms=0),
    ]
    c = QuoteConstraints(bankroll=1.0, min_bet=1.0, bet_increment=0.01, max_bet=None)
    # 2 outcomes * $1 min = $2 > bankroll => infeasible
    res = quote_arbitrage(arb_id="x", legs=legs, constraints=c, stale_cutoff_ms=300000, now_ms=0)
    assert res.ok is False
