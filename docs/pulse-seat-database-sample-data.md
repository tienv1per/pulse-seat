# Pulse Seat Database Sample Data

## `{schema}.idempotency_keys`

| id | scope | idempotency_key | request_hash | response_status | response_body | resource_type | resource_id | expires_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | reserve_seats | idem_reserve_001 | sha256:a101 | 201 | `{"reservation_id":"res_001"}` | reservation | 10001 | 2026-07-12T15:00:00Z |
| 2 | reserve_seats | idem_reserve_002 | sha256:a102 | 201 | `{"reservation_id":"res_002"}` | reservation | 10002 | 2026-07-13T15:00:00Z |
| 3 | create_booking | idem_booking_001 | sha256:b101 | 201 | `{"booking_id":"bk_001"}` | booking | 11001 | 2026-07-12T15:15:00Z |
| 4 | create_payment | idem_payment_001 | sha256:p101 | 201 | `{"payment_id":"pay_001"}` | payment | 13001 | 2026-07-12T15:20:00Z |
| 5 | issue_ticket | idem_ticket_001 | sha256:t101 | 201 | `{"ticket_id":"tkt_001"}` | ticket | 16001 | 2026-07-12T15:25:00Z |

## `identity.users`

| id | external_id | email | phone | display_name | role_code | status | email_verified_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1001 | usr_001 | an.nguyen@example.com | +84901111001 | An Nguyen | FAN | ACTIVE | 2026-05-01T03:00:00Z |
| 1002 | usr_002 | binh.tran@example.com | +84901111002 | Binh Tran | FAN | ACTIVE | 2026-05-02T03:00:00Z |
| 1003 | usr_003 | chi.le@example.com | +84901111003 | Chi Le | ORGANIZER_OWNER | ACTIVE | 2026-05-03T03:00:00Z |
| 1004 | usr_004 | dung.pham@example.com | +84901111004 | Dung Pham | CHECK_IN_STAFF | ACTIVE | 2026-05-04T03:00:00Z |
| 1005 | usr_005 | admin@pulseseat.local | +84901111005 | Pulse Admin | ADMIN | ACTIVE | 2026-05-05T03:00:00Z |

## `identity.auth_sessions`

| id | user_id | refresh_token_hash | device_id | ip_address | status | expires_at |
| --- | --- | --- | --- | --- | --- | --- |
| 2001 | 1001 | rth_001 | ios_iphone_001 | 14.169.1.10 | ACTIVE | 2026-06-24T03:00:00Z |
| 2002 | 1002 | rth_002 | web_chrome_002 | 14.169.1.11 | ACTIVE | 2026-06-24T04:00:00Z |
| 2003 | 1003 | rth_003 | web_safari_003 | 14.169.1.12 | ACTIVE | 2026-06-24T05:00:00Z |
| 2004 | 1004 | rth_004 | android_scan_004 | 14.169.1.13 | REVOKED | 2026-06-20T05:00:00Z |
| 2005 | 1005 | rth_005 | web_admin_005 | 14.169.1.14 | ACTIVE | 2026-06-24T06:00:00Z |

## `identity.roles`

| id | code | name | description |
| --- | --- | --- | --- |
| 1 | FAN | Fan | End user buying tickets |
| 2 | ORGANIZER_OWNER | Organizer Owner | Owns organizer workspace |
| 3 | CHECK_IN_STAFF | Check-in Staff | Scans tickets at venue |
| 4 | ADMIN | Admin | Platform administrator |

## `identity.organizers`

| id | external_id | owner_user_id | name | slug | status | billing_email |
| --- | --- | --- | --- | --- | --- | --- |
| 3001 | org_001 | 1003 | Galaxy Events | galaxy-events | ACTIVE | billing@galaxyevents.vn |
| 3002 | org_002 | 1003 | Blue Harbor Live | blue-harbor-live | ACTIVE | finance@blueharbor.vn |
| 3003 | org_003 | 1003 | Saigon Stage | saigon-stage | ACTIVE | ops@saigonstage.vn |
| 3004 | org_004 | 1003 | Northline Concerts | northline-concerts | SUSPENDED | billing@northline.vn |
| 3005 | org_005 | 1003 | Pulse Showcase | pulse-showcase | ACTIVE | billing@pulseshowcase.vn |

## `booking.artists`

| id | external_id | name | slug | metadata |
| --- | --- | --- | --- | --- |
| 4001 | art_001 | Luna Waves | luna-waves | `{"genre":"pop"}` |
| 4002 | art_002 | The Northline | the-northline | `{"genre":"indie"}` |
| 4003 | art_003 | DJ Pulse | dj-pulse | `{"genre":"edm"}` |
| 4004 | art_004 | Maya Tran | maya-tran | `{"genre":"rnb"}` |
| 4005 | art_005 | Blue Harbor | blue-harbor | `{"genre":"rock"}` |

## `booking.venues`

| id | external_id | name | city | country | timezone | latitude | longitude |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5001 | ven_001 | Galaxy Hall | Ho Chi Minh City | VN | Asia/Ho_Chi_Minh | 10.776900 | 106.700900 |
| 5002 | ven_002 | River Dome | Ho Chi Minh City | VN | Asia/Ho_Chi_Minh | 10.789100 | 106.705200 |
| 5003 | ven_003 | Hanoi Arena | Hanoi | VN | Asia/Ho_Chi_Minh | 21.028500 | 105.854200 |
| 5004 | ven_004 | Da Nang Live House | Da Nang | VN | Asia/Ho_Chi_Minh | 16.054400 | 108.202200 |
| 5005 | ven_005 | Hue Imperial Theater | Hue | VN | Asia/Ho_Chi_Minh | 16.463700 | 107.590900 |

## `booking.events`

| id | external_id | organizer_id | title | slug | status | genre | artists | photos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6001 | evt_001 | 3001 | Luna Waves Live 2026 | luna-waves-live-2026 | PUBLISHED | pop | `[{"name":"Luna Waves"}]` | `["s3://events/luna.jpg"]` |
| 6002 | evt_002 | 3002 | Blue Harbor Night | blue-harbor-night | PUBLISHED | rock | `[{"name":"Blue Harbor"}]` | `["s3://events/blue.jpg"]` |
| 6003 | evt_003 | 3003 | DJ Pulse Countdown | dj-pulse-countdown | PUBLISHED | edm | `[{"name":"DJ Pulse"}]` | `["s3://events/pulse.jpg"]` |
| 6004 | evt_004 | 3004 | The Northline Acoustic | northline-acoustic | DRAFT | indie | `[{"name":"The Northline"}]` | `[]` |
| 6005 | evt_005 | 3005 | Maya Tran Showcase | maya-tran-showcase | CANCELLED | rnb | `[{"name":"Maya Tran"}]` | `["s3://events/maya.jpg"]` |

## `booking.media_assets`

| id | owner_type | owner_id | object_key | checksum | size_bytes | content_type |
| --- | --- | --- | --- | --- | --- | --- |
| 7001 | event | 6001 | events/luna/hero.jpg | sha256:m001 | 2840021 | image/jpeg |
| 7002 | event | 6002 | events/blue/hero.jpg | sha256:m002 | 1940022 | image/jpeg |
| 7003 | venue | 5001 | venues/galaxy/map.png | sha256:m003 | 854002 | image/png |
| 7004 | seat_map | 8001 | seatmaps/galaxy-v1.json | sha256:m004 | 45022 | application/json |
| 7005 | artist | 4004 | artists/maya/avatar.webp | sha256:m005 | 740221 | image/webp |

## `booking.performances`

| id | external_id | event_id | venue_id | seat_map_id | starts_at | status | onsale_starts_at | offsale_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8001 | perf_001 | 6001 | 5001 | 9001 | 2026-07-12T13:00:00Z | ONSALE | 2026-05-24T02:00:00Z | 2026-07-12T12:00:00Z |
| 8002 | perf_002 | 6002 | 5002 | 9002 | 2026-07-19T13:00:00Z | ONSALE | 2026-05-24T02:00:00Z | 2026-07-19T12:00:00Z |
| 8003 | perf_003 | 6003 | 5003 | 9003 | 2026-08-01T14:00:00Z | ONSALE | 2026-05-25T02:00:00Z | 2026-08-01T13:00:00Z |
| 8004 | perf_004 | 6004 | 5004 | 9004 | 2026-08-15T13:30:00Z | DRAFT | 2026-06-01T02:00:00Z | 2026-08-15T12:30:00Z |
| 8005 | perf_005 | 6005 | 5005 | 9005 | 2026-09-05T13:00:00Z | CANCELLED | 2026-06-01T02:00:00Z | 2026-09-05T12:00:00Z |

## `booking.seat_maps`

| id | venue_id | name | version | status | layout_json | seat_count |
| --- | --- | --- | --- | --- | --- | --- |
| 9001 | 5001 | Galaxy Hall Main | 1 | ACTIVE | `{"sections":[{"label":"VIP","rows":["A","B"]}]}` | 240 |
| 9002 | 5002 | River Dome Main | 1 | ACTIVE | `{"sections":[{"label":"Floor","rows":["A","B","C"]}]}` | 320 |
| 9003 | 5003 | Hanoi Arena Concert | 1 | ACTIVE | `{"sections":[{"label":"Premium","rows":["P","Q"]}]}` | 500 |
| 9004 | 5004 | Da Nang Live Small | 1 | DRAFT | `{"sections":[{"label":"Main","rows":["A"]}]}` | 120 |
| 9005 | 5005 | Hue Imperial Theater | 2 | ARCHIVED | `{"sections":[{"label":"Balcony","rows":["B"]}]}` | 180 |

## `booking.ticket_tiers`

| id | performance_id | name | code | price | currency | visibility | max_per_order |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10001 | 8001 | VIP | VIP | 1800000 | VND | PUBLIC | 4 |
| 10002 | 8001 | Standard | STD | 950000 | VND | PUBLIC | 6 |
| 10003 | 8002 | Floor | FLOOR | 1200000 | VND | PUBLIC | 4 |
| 10004 | 8003 | Premium | PREMIUM | 1500000 | VND | ACCESS_CODE | 2 |
| 10005 | 8004 | Early Bird | EARLY | 700000 | VND | HIDDEN | 4 |

## `booking.seat_availability`

| performance_id | seat_key | tier_id | section_label | row_label | seat_number | seat_label | status | reservation_id | booking_id | held_until | version |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8001 | VIP-A-01 | 10001 | VIP | A | 01 | VIP A01 | SOLD | 11001 | 12001 | null | 4 |
| 8001 | VIP-A-02 | 10001 | VIP | A | 02 | VIP A02 | HELD | 11002 | null | 2026-07-12T12:45:00Z | 3 |
| 8001 | VIP-A-03 | 10001 | VIP | A | 03 | VIP A03 | AVAILABLE | null | null | null | 1 |
| 8001 | STD-B-10 | 10002 | Standard | B | 10 | Standard B10 | BLOCKED | null | null | null | 2 |
| 8002 | FLOOR-A-05 | 10003 | Floor | A | 05 | Floor A05 | SOLD | 11003 | 12003 | null | 5 |

## `booking.reservations`

| id | external_id | idempotency_key | user_id | performance_id | status | held_until | total_price | currency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11001 | res_001 | idem_reserve_001 | 1001 | 8001 | CONFIRMED | 2026-07-12T12:35:00Z | 1800000 | VND |
| 11002 | res_002 | idem_reserve_002 | 1002 | 8001 | HELD | 2026-07-12T12:45:00Z | 1800000 | VND |
| 11003 | res_003 | idem_reserve_003 | 1001 | 8002 | CONFIRMED | 2026-07-19T12:35:00Z | 1200000 | VND |
| 11004 | res_004 | idem_reserve_004 | 1002 | 8003 | EXPIRED | 2026-08-01T12:10:00Z | 1500000 | VND |
| 11005 | res_005 | idem_reserve_005 | 1001 | 8001 | RELEASED | 2026-07-12T11:30:00Z | 950000 | VND |

## `booking.reservation_items`

| id | reservation_id | seat_key | section_label | row_label | seat_number | seat_label | tier_id | unit_price | currency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11101 | 11001 | VIP-A-01 | VIP | A | 01 | VIP A01 | 10001 | 1800000 | VND |
| 11102 | 11002 | VIP-A-02 | VIP | A | 02 | VIP A02 | 10001 | 1800000 | VND |
| 11103 | 11003 | FLOOR-A-05 | Floor | A | 05 | Floor A05 | 10003 | 1200000 | VND |
| 11104 | 11004 | PREMIUM-P-08 | Premium | P | 08 | Premium P08 | 10004 | 1500000 | VND |
| 11105 | 11005 | STD-B-11 | Standard | B | 11 | Standard B11 | 10002 | 950000 | VND |

## `booking.bookings`

| id | external_id | idempotency_key | reservation_id | user_id | buyer_email | buyer_name | total_amount | currency | status | payment_external_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12001 | bk_001 | idem_booking_001 | 11001 | 1001 | an.nguyen@example.com | An Nguyen | 1800000 | VND | CONFIRMED | pay_001 |
| 12002 | bk_002 | idem_booking_002 | 11002 | 1002 | binh.tran@example.com | Binh Tran | 1800000 | VND | PAYMENT_PENDING | pay_002 |
| 12003 | bk_003 | idem_booking_003 | 11003 | 1001 | an.nguyen@example.com | An Nguyen | 1200000 | VND | CONFIRMED | pay_003 |
| 12004 | bk_004 | idem_booking_004 | 11004 | 1002 | binh.tran@example.com | Binh Tran | 1500000 | VND | EXPIRED | null |
| 12005 | bk_005 | idem_booking_005 | 11005 | 1001 | an.nguyen@example.com | An Nguyen | 950000 | VND | CANCELLED | pay_005 |

## `booking.booking_items`

| id | booking_id | reservation_item_id | attendee_name | attendee_email |
| --- | --- | --- | --- | --- |
| 12101 | 12001 | 11101 | An Nguyen | an.nguyen@example.com |
| 12102 | 12002 | 11102 | Binh Tran | binh.tran@example.com |
| 12103 | 12003 | 11103 | An Nguyen | an.nguyen@example.com |
| 12104 | 12004 | 11104 | Binh Tran | binh.tran@example.com |
| 12105 | 12005 | 11105 | An Nguyen | an.nguyen@example.com |

## `payment.payments`

| id | external_id | idempotency_key | booking_id | booking_external_id | provider | provider_payment_id | amount | currency | status | client_action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13001 | pay_001 | idem_payment_001 | 12001 | bk_001 | stripe | pi_001 | 1800000 | VND | CAPTURED | `{}` |
| 13002 | pay_002 | idem_payment_002 | 12002 | bk_002 | stripe | pi_002 | 1800000 | VND | REQUIRES_ACTION | `{"redirect_url":"https://pay.example/002"}` |
| 13003 | pay_003 | idem_payment_003 | 12003 | bk_003 | vnpay | vnp_003 | 1200000 | VND | CAPTURED | `{}` |
| 13004 | pay_004 | idem_payment_004 | 12004 | bk_004 | momo | momo_004 | 1500000 | VND | EXPIRED | `{}` |
| 13005 | pay_005 | idem_payment_005 | 12005 | bk_005 | stripe | pi_005 | 950000 | VND | REFUNDED | `{}` |

## `payment.payment_webhooks`

| id | provider | provider_event_id | event_type | signature_valid | processed_status | processed_at |
| --- | --- | --- | --- | --- | --- | --- |
| 14001 | stripe | evt_stripe_001 | payment.succeeded | true | PROCESSED | 2026-07-12T12:20:00Z |
| 14002 | stripe | evt_stripe_002 | payment.requires_action | true | PROCESSED | 2026-07-12T12:21:00Z |
| 14003 | vnpay | evt_vnp_003 | payment.captured | true | PROCESSED | 2026-07-19T12:22:00Z |
| 14004 | momo | evt_momo_004 | payment.expired | true | PROCESSED | 2026-08-01T12:23:00Z |
| 14005 | stripe | evt_stripe_005 | charge.refunded | true | PROCESSED | 2026-07-12T12:24:00Z |

## `payment.refunds`

| id | external_id | payment_id | provider_refund_id | amount | currency | status | reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15001 | ref_001 | 13005 | re_001 | 950000 | VND | SUCCEEDED | customer_cancelled |
| 15002 | ref_002 | 13001 | re_002 | 500000 | VND | REQUESTED | partial_refund |
| 15003 | ref_003 | 13003 | re_003 | 1200000 | VND | FAILED | provider_declined |
| 15004 | ref_004 | 13002 | null | 1800000 | VND | REQUESTED | payment_timeout |
| 15005 | ref_005 | 13004 | re_005 | 1500000 | VND | SUCCEEDED | event_cancelled |

## `ticket.tickets`

| id | external_id | booking_external_id | booking_item_id | performance_id | seat_key | section_label | row_label | seat_number | seat_label | tier_id | qr_token_hash | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16001 | tkt_001 | bk_001 | 12101 | 8001 | VIP-A-01 | VIP | A | 01 | VIP A01 | 10001 | qrh_001 | ACTIVE |
| 16002 | tkt_002 | bk_002 | 12102 | 8001 | VIP-A-02 | VIP | A | 02 | VIP A02 | 10001 | qrh_002 | ACTIVE |
| 16003 | tkt_003 | bk_003 | 12103 | 8002 | FLOOR-A-05 | Floor | A | 05 | Floor A05 | 10003 | qrh_003 | USED |
| 16004 | tkt_004 | bk_004 | 12104 | 8003 | PREMIUM-P-08 | Premium | P | 08 | Premium P08 | 10004 | qrh_004 | VOID |
| 16005 | tkt_005 | bk_005 | 12105 | 8001 | STD-B-11 | Standard | B | 11 | Standard B11 | 10002 | qrh_005 | REFUNDED |

## `notification.notification_templates`

| id | code | channel | locale | subject_template | body_template | status |
| --- | --- | --- | --- | --- | --- | --- |
| 17001 | BOOKING_CONFIRMED | EMAIL | vi-VN | Xác nhận đặt vé | Xin chào {{name}}, vé của bạn đã sẵn sàng. | ACTIVE |
| 17002 | PAYMENT_PENDING | EMAIL | vi-VN | Hoàn tất thanh toán | Vui lòng thanh toán trước {{expires_at}}. | ACTIVE |
| 17003 | TICKET_ISSUED | SMS | vi-VN | null | Vé {{ticket_id}} đã được phát hành. | ACTIVE |
| 17004 | EVENT_CANCELLED | EMAIL | vi-VN | Sự kiện đã hủy | Sự kiện {{event_title}} đã bị hủy. | ACTIVE |
| 17005 | REFUND_SUCCEEDED | EMAIL | vi-VN | Hoàn tiền thành công | Khoản hoàn tiền {{amount}} đã thành công. | DISABLED |

## `notification.notification_jobs`

| id | external_id | event_id | recipient | channel | template_code | status | retry_count | provider_message_id |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18001 | ntf_001 | evt_booking_confirmed_001 | an.nguyen@example.com | EMAIL | BOOKING_CONFIRMED | SENT | 0 | msg_001 |
| 18002 | ntf_002 | evt_payment_pending_002 | binh.tran@example.com | EMAIL | PAYMENT_PENDING | PENDING | 0 | null |
| 18003 | ntf_003 | evt_ticket_issued_003 | +84901111001 | SMS | TICKET_ISSUED | SENT | 0 | sms_003 |
| 18004 | ntf_004 | evt_event_cancelled_004 | binh.tran@example.com | EMAIL | EVENT_CANCELLED | FAILED | 3 | null |
| 18005 | ntf_005 | evt_refund_005 | an.nguyen@example.com | EMAIL | REFUND_SUCCEEDED | CANCELLED | 0 | null |

## `notification.notification_logs`

| id | job_id | provider | status | provider_event_id | message | created_at |
| --- | --- | --- | --- | --- | --- | --- |
| 19001 | 18001 | sendgrid | SENT | sg_evt_001 | accepted | 2026-07-12T12:30:00Z |
| 19002 | 18001 | sendgrid | DELIVERED | sg_evt_002 | delivered | 2026-07-12T12:31:00Z |
| 19003 | 18003 | twilio | SENT | tw_evt_003 | queued | 2026-07-12T12:32:00Z |
| 19004 | 18004 | sendgrid | FAILED | sg_evt_004 | invalid recipient | 2026-07-12T12:33:00Z |
| 19005 | 18002 | sendgrid | FAILED | sg_evt_005 | provider timeout | 2026-07-12T12:34:00Z |

## `{schema}.domain_events`

| id | aggregate_type | aggregate_id | event_type | event_version | payload | correlation_id | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 20001 | reservation | res_001 | ReservationHeld | 1 | `{"reservation_id":"res_001","seat_key":"VIP-A-01"}` | corr_001 | 2026-07-12T12:10:00Z |
| 20002 | booking | bk_001 | BookingCreated | 1 | `{"booking_id":"bk_001","amount":1800000}` | corr_001 | 2026-07-12T12:11:00Z |
| 20003 | payment | pay_001 | PaymentCaptured | 1 | `{"payment_id":"pay_001","booking_id":"bk_001"}` | corr_001 | 2026-07-12T12:20:00Z |
| 20004 | booking | bk_001 | BookingConfirmed | 1 | `{"booking_id":"bk_001"}` | corr_001 | 2026-07-12T12:21:00Z |
| 20005 | ticket | tkt_001 | TicketIssued | 1 | `{"ticket_id":"tkt_001","seat_key":"VIP-A-01"}` | corr_001 | 2026-07-12T12:22:00Z |

## `{schema}.outbox_messages`

| id | event_id | topic | key | payload | status | retry_count | published_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21001 | 20001 | booking.reservation.held | res_001 | `{"reservation_id":"res_001"}` | PUBLISHED | 0 | 2026-07-12T12:10:05Z |
| 21002 | 20002 | booking.created | bk_001 | `{"booking_id":"bk_001"}` | PUBLISHED | 0 | 2026-07-12T12:11:05Z |
| 21003 | 20003 | payment.captured | bk_001 | `{"payment_id":"pay_001"}` | PUBLISHED | 0 | 2026-07-12T12:20:05Z |
| 21004 | 20004 | booking.confirmed | bk_001 | `{"booking_id":"bk_001"}` | PENDING | 1 | null |
| 21005 | 20005 | ticket.issued | tkt_001 | `{"ticket_id":"tkt_001"}` | FAILED | 3 | null |

## `ops.processed_events`

| consumer_name | event_id | event_type | processed_at |
| --- | --- | --- | --- |
| ticket-service | evt_payment_captured_001 | PaymentCaptured | 2026-07-12T12:21:00Z |
| notification-service | evt_booking_confirmed_001 | BookingConfirmed | 2026-07-12T12:22:00Z |
| search-projector | evt_event_published_001 | EventPublished | 2026-05-24T02:10:00Z |
| booking-service | evt_payment_failed_002 | PaymentFailed | 2026-07-12T12:23:00Z |
| audit-worker | evt_ticket_issued_001 | TicketIssued | 2026-07-12T12:24:00Z |

## `search_read.event_cards`

| event_external_id | title | slug | venue_name | city | starts_at_min | starts_at_max | min_price | currency | status | genres |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| evt_001 | Luna Waves Live 2026 | luna-waves-live-2026 | Galaxy Hall | Ho Chi Minh City | 2026-07-12T13:00:00Z | 2026-07-12T13:00:00Z | 950000 | VND | PUBLISHED | `{pop}` |
| evt_002 | Blue Harbor Night | blue-harbor-night | River Dome | Ho Chi Minh City | 2026-07-19T13:00:00Z | 2026-07-19T13:00:00Z | 1200000 | VND | PUBLISHED | `{rock}` |
| evt_003 | DJ Pulse Countdown | dj-pulse-countdown | Hanoi Arena | Hanoi | 2026-08-01T14:00:00Z | 2026-08-01T14:00:00Z | 1500000 | VND | PUBLISHED | `{edm}` |
| evt_004 | The Northline Acoustic | northline-acoustic | Da Nang Live House | Da Nang | 2026-08-15T13:30:00Z | 2026-08-15T13:30:00Z | 700000 | VND | DRAFT | `{indie}` |
| evt_005 | Maya Tran Showcase | maya-tran-showcase | Hue Imperial Theater | Hue | 2026-09-05T13:00:00Z | 2026-09-05T13:00:00Z | 900000 | VND | CANCELLED | `{rnb}` |
