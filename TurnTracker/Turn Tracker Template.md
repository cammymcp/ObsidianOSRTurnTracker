<%* tR += await tp.user.build_turn_tracker(tp) %>

`BUTTON[end_turn, advance_tracker_1hr, advance_tracker_3hr, advance_tracker_8hr, add_day_to_tracker]`
`BUTTON[light_torch, light_lantern, clear_all_light_sources, clear_expired_light_sources]`

**Track Effect** `INPUT[text(limit(3), placeholder(Label)):customEffectLabel]` `INPUT[number(placeholder(Duration)):customTurnDuration]` turns
`BUTTON[track_custom_effect, clear_custom_effects, clear_expired_custom_effects]`

