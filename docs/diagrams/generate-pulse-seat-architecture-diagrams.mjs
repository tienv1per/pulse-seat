import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = new URL('.', import.meta.url).pathname

const C = {
  primaryFill: '#3b82f6',
  primaryStroke: '#1e3a5f',
  secondaryFill: '#60a5fa',
  tertiaryFill: '#93c5fd',
  startFill: '#fed7aa',
  startStroke: '#c2410c',
  successFill: '#a7f3d0',
  successStroke: '#047857',
  warningFill: '#fee2e2',
  warningStroke: '#dc2626',
  decisionFill: '#fef3c7',
  decisionStroke: '#b45309',
  aiFill: '#ddd6fe',
  aiStroke: '#6d28d9',
  inactiveFill: '#dbeafe',
  inactiveStroke: '#1e40af',
  errorFill: '#fecaca',
  errorStroke: '#b91c1c',
  title: '#1e40af',
  subtitle: '#3b82f6',
  body: '#64748b',
  dark: '#1e293b',
  greenText: '#22c55e',
  onLight: '#374151',
  white: '#ffffff',
}

let seq = 1
function seed() {
  return 900000 + seq++
}

function base(type, id, x, y, width, height, extra = {}) {
  return {
    type,
    id,
    x,
    y,
    width,
    height,
    strokeColor: extra.strokeColor ?? C.primaryStroke,
    backgroundColor: extra.backgroundColor ?? 'transparent',
    fillStyle: 'solid',
    strokeWidth: extra.strokeWidth ?? 2,
    strokeStyle: extra.strokeStyle ?? 'solid',
    roughness: 0,
    opacity: 100,
    angle: 0,
    seed: seed(),
    version: 1,
    versionNonce: seed(),
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    link: null,
    locked: false,
    ...extra,
  }
}

function rect(id, x, y, width, height, opts = {}) {
  return base('rectangle', id, x, y, width, height, {
    roundness: { type: 3 },
    ...opts,
  })
}

function ellipse(id, x, y, width, height, opts = {}) {
  return base('ellipse', id, x, y, width, height, opts)
}

function text(id, x, y, width, height, value, opts = {}) {
  return {
    ...base('text', id, x, y, width, height, {
      strokeWidth: 1,
      strokeStyle: 'solid',
      backgroundColor: 'transparent',
      strokeColor: opts.strokeColor ?? C.onLight,
    }),
    text: value,
    originalText: value,
    fontSize: opts.fontSize ?? 18,
    fontFamily: 3,
    textAlign: opts.textAlign ?? 'center',
    verticalAlign: opts.verticalAlign ?? 'middle',
    containerId: null,
    lineHeight: 1.25,
  }
}

function line(id, x, y, points, opts = {}) {
  const xs = points.map(([px]) => px)
  const ys = points.map(([, py]) => py)
  return base('line', id, x, y, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
    points,
    backgroundColor: 'transparent',
    strokeColor: opts.strokeColor ?? C.body,
    strokeWidth: opts.strokeWidth ?? 2,
    strokeStyle: opts.strokeStyle ?? 'solid',
  })
}

function arrow(id, x, y, points, opts = {}) {
  const xs = points.map(([px]) => px)
  const ys = points.map(([, py]) => py)
  return base('arrow', id, x, y, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
    points,
    backgroundColor: 'transparent',
    strokeColor: opts.strokeColor ?? C.primaryStroke,
    strokeWidth: opts.strokeWidth ?? 2,
    strokeStyle: opts.strokeStyle ?? 'solid',
    startArrowhead: opts.startArrowhead ?? null,
    endArrowhead: opts.endArrowhead ?? 'arrow',
  })
}

function label(id, x, y, value, opts = {}) {
  return text(id, x, y, opts.width ?? 220, opts.height ?? 28, value, {
    fontSize: opts.fontSize ?? 16,
    strokeColor: opts.strokeColor ?? C.body,
    textAlign: opts.textAlign ?? 'left',
    verticalAlign: 'top',
  })
}

function layer(id, x, y, width, height, title) {
  return [
    rect(`${id}_box`, x, y, width, height, {
      strokeColor: C.body,
      backgroundColor: 'transparent',
      strokeStyle: 'dashed',
      strokeWidth: 2,
    }),
    text(`${id}_title`, x + 16, y + 12, 460, 24, title.toUpperCase(), {
      fontSize: 16,
      textAlign: 'left',
      verticalAlign: 'top',
      strokeColor: C.body,
    }),
  ]
}

function boxWithText(id, x, y, width, height, title, detail, opts = {}) {
  const fill = opts.fill ?? C.inactiveFill
  const stroke = opts.stroke ?? C.inactiveStroke
  const titleColor = opts.titleColor ?? C.title
  const bodyColor = opts.bodyColor ?? C.onLight
  const compact = height < 70
  const titleY = compact ? y + 7 : y + 14
  const titleH = compact ? 20 : 28
  const detailY = compact ? y + 30 : y + 48
  const detailH = compact ? Math.max(18, height - 36) : Math.max(22, height - 56)
  return [
    rect(id, x, y, width, height, {
      strokeColor: stroke,
      backgroundColor: fill,
      strokeWidth: opts.strokeWidth ?? 2,
      strokeStyle: opts.strokeStyle ?? 'solid',
    }),
    text(`${id}_title`, x + 18, titleY, width - 36, titleH, title, {
      fontSize: opts.titleSize ?? 20,
      strokeColor: titleColor,
      textAlign: 'center',
      verticalAlign: 'middle',
    }),
    text(`${id}_detail`, x + 18, detailY, width - 36, detailH, detail, {
      fontSize: opts.detailSize ?? 15,
      strokeColor: bodyColor,
      textAlign: 'center',
      verticalAlign: 'middle',
    }),
  ]
}

function serviceBox(id, x, y, width, height, title, detail, opts = {}) {
  return boxWithText(id, x, y, width, height, title, detail, {
    fill: opts.fill ?? C.tertiaryFill,
    stroke: opts.stroke ?? C.primaryStroke,
    titleColor: opts.titleColor ?? C.title,
    bodyColor: opts.bodyColor ?? C.onLight,
    titleSize: opts.titleSize ?? 20,
    detailSize: opts.detailSize ?? 14,
  })
}

function dbBox(id, x, y, width, height, title, detail, opts = {}) {
  return boxWithText(id, x, y, width, height, title, detail, {
    fill: opts.fill ?? C.successFill,
    stroke: opts.stroke ?? C.successStroke,
    titleColor: opts.titleColor ?? C.successStroke,
    bodyColor: opts.bodyColor ?? C.onLight,
    titleSize: opts.titleSize ?? 18,
    detailSize: opts.detailSize ?? 13,
  })
}

function codeBox(id, x, y, width, height, title, body) {
  return [
    rect(id, x, y, width, height, {
      strokeColor: C.dark,
      backgroundColor: C.dark,
      strokeWidth: 2,
    }),
    text(`${id}_title`, x + 18, y + 16, width - 36, 24, title, {
      fontSize: 17,
      strokeColor: C.white,
      textAlign: 'left',
      verticalAlign: 'top',
    }),
    text(`${id}_body`, x + 18, y + 52, width - 36, height - 64, body, {
      fontSize: 13,
      strokeColor: C.greenText,
      textAlign: 'left',
      verticalAlign: 'top',
    }),
  ]
}

function topicChip(id, x, y, labelText, fill = C.decisionFill, stroke = C.decisionStroke) {
  return [
    rect(id, x, y, 190, 34, {
      strokeColor: stroke,
      backgroundColor: fill,
      strokeWidth: 1,
    }),
    text(`${id}_text`, x + 10, y + 7, 170, 18, labelText, {
      fontSize: 13,
      strokeColor: C.onLight,
    }),
  ]
}

function hld() {
  const e = []
  e.push(
    text('title', 545, 22, 710, 48, 'Pulse Seat Microservices HLD', {
      fontSize: 34,
      strokeColor: C.title,
    }),
    text('subtitle', 395, 68, 1010, 30, 'Read path is cached and eventually consistent; reserve and confirm stay strongly consistent in Booking Service.', {
      fontSize: 16,
      strokeColor: C.body,
    }),
  )

  e.push(...layer('client_layer', 40, 115, 1720, 145, 'Client layer'))
  e.push(...boxWithText('fan_client', 230, 144, 270, 84, 'Fan Web / Mobile', 'Discovery · Seat map\nCheckout · Ticket wallet', { fill: C.inactiveFill, stroke: C.inactiveStroke, titleSize: 18, detailSize: 12 }))
  e.push(...boxWithText('org_client', 620, 144, 270, 84, 'Organizer Console', 'Events · Tiers · Seat maps\nSales dashboard', { fill: C.inactiveFill, stroke: C.inactiveStroke, titleSize: 18, detailSize: 12 }))
  e.push(...boxWithText('staff_client', 1010, 144, 270, 84, 'Staff Scanner', 'Gate scan · Duplicate detection\nManual lookup', { fill: C.inactiveFill, stroke: C.inactiveStroke, titleSize: 18, detailSize: 12 }))
  e.push(...boxWithText('admin_client', 1400, 144, 270, 84, 'Admin Console', 'Risk · Audit · Reconciliation\nRBAC', { fill: C.inactiveFill, stroke: C.inactiveStroke, titleSize: 18, detailSize: 12 }))

  e.push(...layer('gateway_layer', 40, 300, 1720, 165, 'Gateway layer'))
  e.push(...boxWithText('cdn', 250, 335, 270, 82, 'CDN + WAF', 'Static/media acceleration\nEdge rate limits', { fill: C.decisionFill, stroke: C.decisionStroke }))
  e.push(...boxWithText('api_gateway', 660, 322, 420, 108, 'API Gateway', 'REST /v1 routing\nAuth context propagation\nIdempotency + correlation IDs', { fill: C.aiFill, stroke: C.aiStroke, titleColor: C.aiStroke }))
  e.push(...boxWithText('edge_policy', 1220, 335, 300, 82, 'Routing policy', '/auth/*  /events/*\n/reservations/*  /tickets/*', { fill: C.decisionFill, stroke: C.decisionStroke }))

  e.push(...layer('service_layer', 40, 505, 1720, 330, 'Services layer'))
  const services = [
    ['identity', 75, 'Identity / RBAC', 'JWT · sessions\nOrganizer/staff roles'],
    ['search', 360, 'Search Service', 'Full-text facets\nCache-backed discovery'],
    ['booking', 645, 'Booking Service', 'Event · seat map · tiers\nReserve TTL · checkout aggregate'],
    ['payment', 930, 'Payment Service', 'Payment intents\nWebhook · refund · reconcile'],
    ['ticket', 1215, 'Ticket Service', 'QR issue · scan\nVoid · duplicate detection'],
    ['notify', 1500, 'Notification Service', 'Email/SMS templates\nRetry delivery log'],
  ]
  for (const [id, x, title, detail] of services) {
    const special = id === 'booking'
    e.push(...serviceBox(`${id}_svc`, x, 555, 245, 136, title, detail, {
      fill: special ? C.successFill : C.tertiaryFill,
      stroke: special ? C.successStroke : C.primaryStroke,
      titleColor: special ? C.successStroke : C.title,
    }))
  }
  e.push(...boxWithText('expiry_worker', 530, 735, 300, 58, 'Reservation Expiry Worker', 'releases expired HELD seats / GA counts', { fill: C.startFill, stroke: C.startStroke, titleSize: 17, detailSize: 12 }))
  e.push(...boxWithText('cdc_worker', 960, 735, 300, 58, 'CDC / Sync Job', 'outbox -> Elasticsearch + Redis invalidation', { fill: C.startFill, stroke: C.startStroke, titleSize: 17, detailSize: 12 }))

  e.push(...layer('messaging_layer', 40, 875, 1720, 155, 'Messaging layer'))
  e.push(...boxWithText('outbox', 210, 915, 270, 70, 'Transactional Outbox', 'written in service DB transaction', { fill: C.decisionFill, stroke: C.decisionStroke }))
  e.push(...boxWithText('event_bus', 610, 902, 570, 94, 'Event Bus', 'Kafka / Redpanda / NATS / RabbitMQ\nfan-out domain events + retry/DLQ', { fill: C.startFill, stroke: C.startStroke, titleSize: 22 }))
  e.push(...boxWithText('dlq', 1320, 908, 270, 84, 'Retry + DLQ', 'idempotent consumers\nprocessed_event_ids', { fill: C.warningFill, stroke: C.warningStroke, titleSize: 18, detailSize: 12 }))

  e.push(...layer('data_layer', 40, 1070, 1720, 230, 'Data + external integration layer'))
  const dbs = [
    ['identity_db', 70, 'identity_db', 'users · sessions · roles'],
    ['booking_db', 285, 'booking_db', 'events · seats · reservations · bookings'],
    ['payment_db', 500, 'payment_db', 'payments · refunds · PSP refs'],
    ['ticket_db', 715, 'ticket_db', 'tickets · scans · QR hashes'],
    ['notify_db', 930, 'notification_db', 'templates · delivery log'],
  ]
  for (const [id, x, title, detail] of dbs) {
    e.push(...dbBox(id, x, 1120, 190, 92, title, detail))
  }
  e.push(...dbBox('redis', 1155, 1120, 180, 92, 'Redis', 'sessions · rate limit\nquery/detail cache', { fill: C.errorFill, stroke: C.warningStroke, titleColor: C.warningStroke }))
  e.push(...dbBox('elastic', 1355, 1120, 180, 92, 'Elasticsearch', 'event documents\nfaceted search', { fill: C.tertiaryFill, stroke: C.primaryStroke, titleColor: C.title }))
  e.push(...dbBox('minio', 1555, 1120, 180, 92, 'MinIO', 'event images\nobject keys in DB', { fill: C.tertiaryFill, stroke: C.primaryStroke, titleColor: C.title }))
  e.push(...boxWithText('external_providers', 640, 1230, 500, 58, 'External Providers', 'PSP adapters + Email/SMS provider', { fill: C.aiFill, stroke: C.aiStroke, titleSize: 16, detailSize: 12, titleColor: C.aiStroke }))

  e.push(...layer('ops_layer', 40, 1335, 1720, 90, 'Operations layer'))
  e.push(...boxWithText('observability', 300, 1362, 1200, 54, 'Observability + resilience', 'OpenTelemetry · x-correlation-id · logs · metrics · health/readiness · circuit breakers · retry budgets', { fill: C.aiFill, stroke: C.aiStroke, titleSize: 16, detailSize: 12, titleColor: C.aiStroke }))

  // Main synchronous flow.
  e.push(arrow('clients_to_gateway', 900, 222, [[0, 0], [0, 100]], { strokeColor: C.inactiveStroke, strokeWidth: 3 }))
  e.push(arrow('cdn_to_gateway', 520, 376, [[0, 0], [135, 0]], { strokeColor: C.decisionStroke }))
  e.push(arrow('gateway_to_policy', 1080, 376, [[0, 0], [135, 0]], { strokeColor: C.aiStroke }))
  for (const [id, x] of services.map(([id, x]) => [id, x + 122])) {
    e.push(arrow(`gateway_to_${id}`, 870, 430, [[0, 0], [x - 870, 125]], { strokeColor: C.aiStroke, strokeWidth: id === 'booking' ? 3 : 2 }))
  }
  e.push(arrow('booking_to_payment', 890, 615, [[0, 0], [38, 0]], { strokeColor: C.successStroke }))
  e.push(arrow('payment_to_ticket', 1175, 615, [[0, 0], [38, 0]], { strokeColor: C.primaryStroke }))
  e.push(arrow('ticket_to_notify', 1460, 615, [[0, 0], [38, 0]], { strokeColor: C.primaryStroke }))

  // Async/event flow, simplified in HLD to avoid visual noise.
  e.push(arrow('services_to_outbox', 900, 692, [[0, 0], [-560, 220]], { strokeColor: C.startStroke, strokeStyle: 'dashed', strokeWidth: 3 }))
  e.push(arrow('services_to_bus', 900, 692, [[0, 0], [0, 206]], { strokeColor: C.startStroke, strokeStyle: 'dashed', strokeWidth: 3 }))
  e.push(arrow('outbox_to_bus', 480, 950, [[0, 0], [128, 0]], { strokeColor: C.decisionStroke }))
  e.push(arrow('bus_to_dlq', 1182, 950, [[0, 0], [136, 0]], { strokeColor: C.startStroke }))
  e.push(arrow('bus_to_expiry', 810, 902, [[0, 0], [-120, -108]], { strokeColor: C.startStroke }))
  e.push(arrow('bus_to_cdc', 990, 902, [[0, 0], [120, -108]], { strokeColor: C.startStroke }))

  // Data ownership and read-model arrows.
  e.push(arrow('booking_data', 767, 692, [[0, 0], [-387, 428]], { strokeColor: C.successStroke, strokeStyle: 'dashed', strokeWidth: 3 }))
  e.push(arrow('cdc_to_redis', 1110, 793, [[0, 0], [135, 327]], { strokeColor: C.warningStroke }))
  e.push(arrow('cdc_to_elastic', 1110, 793, [[0, 0], [335, 327]], { strokeColor: C.primaryStroke }))
  e.push(arrow('expiry_to_booking_db', 680, 793, [[0, 0], [-300, 327]], { strokeColor: C.successStroke }))

  e.push(
    label('sync_label', 1110, 462, 'REST / gRPC commands', { strokeColor: C.aiStroke, width: 200 }),
    label('event_label', 1210, 870, 'domain events fan out from outbox', { strokeColor: C.startStroke, width: 320 }),
  )

  return wrap(e)
}

function hexService(id, x, y, width, height, title, inbound, core, outbound, opts = {}) {
  const e = []
  e.push(rect(id, x, y, width, height, {
    strokeColor: opts.stroke ?? C.primaryStroke,
    backgroundColor: opts.fill ?? C.inactiveFill,
    strokeWidth: opts.strokeWidth ?? 2,
  }))
  e.push(text(`${id}_title`, x + 18, y + 14, width - 36, 24, title, {
    fontSize: 19,
    strokeColor: opts.titleColor ?? C.title,
  }))
  const bandW = width - 34
  e.push(rect(`${id}_inbound`, x + 17, y + 48, bandW, 54, { strokeColor: C.primaryStroke, backgroundColor: C.tertiaryFill, strokeWidth: 1 }))
  e.push(text(`${id}_inbound_text`, x + 27, y + 58, bandW - 20, 34, inbound, { fontSize: 12, strokeColor: C.onLight }))
  e.push(rect(`${id}_core`, x + 17, y + 112, bandW, 74, { strokeColor: opts.coreStroke ?? C.successStroke, backgroundColor: opts.coreFill ?? C.successFill, strokeWidth: 2 }))
  e.push(text(`${id}_core_text`, x + 27, y + 122, bandW - 20, 54, core, { fontSize: 13, strokeColor: C.onLight }))
  e.push(rect(`${id}_outbound`, x + 17, y + 196, bandW, 54, { strokeColor: C.decisionStroke, backgroundColor: C.decisionFill, strokeWidth: 1 }))
  e.push(text(`${id}_outbound_text`, x + 27, y + 206, bandW - 20, 34, outbound, { fontSize: 12, strokeColor: C.onLight }))
  return e
}

function systemArchitecture() {
  const e = []
  e.push(
    text('title', 595, 22, 930, 48, 'Pulse Seat Detailed Microservices Architecture', {
      fontSize: 34,
      strokeColor: C.title,
    }),
    text('subtitle', 410, 68, 1310, 30, 'Each service owns its data, exposes explicit ports, publishes integration events, and keeps domain logic inside the application core.', {
      fontSize: 16,
      strokeColor: C.body,
    }),
  )

  e.push(...layer('top_layer', 45, 120, 2130, 210, 'Ingress and public API'))
  e.push(...boxWithText('clients', 95, 154, 290, 116, 'Clients', 'Fan Web/Mobile\nOrganizer/Admin Console\nStaff Scanner', { fill: C.inactiveFill, stroke: C.inactiveStroke, titleSize: 19, detailSize: 13 }))
  e.push(...boxWithText('cdn_gateway', 485, 166, 310, 92, 'CDN + API Gateway', 'TLS · rate limits · request routing\nx-correlation-id · Idempotency-Key', { fill: C.aiFill, stroke: C.aiStroke, titleColor: C.aiStroke }))
  e.push(...codeBox('api_contracts', 900, 145, 510, 150, 'Public REST contracts', 'GET  /v1/events/search\nGET  /v1/events/{event_id}\nPOST /v1/reservations\nPOST /v1/bookings\nPOST /v1/check-ins/scan'))
  e.push(...codeBox('response_contracts', 1510, 145, 560, 150, 'Critical response states', 'reservation.status = HELD | EXPIRED\nbooking.status = CONFIRMED | PAYMENT_PENDING\nscan.status = ACCEPTED | DUPLICATE | VOID'))
  e.push(arrow('clients_to_gateway', 385, 212, [[0, 0], [98, 0]], { strokeColor: C.inactiveStroke }))
  e.push(arrow('gateway_to_contracts', 795, 212, [[0, 0], [100, 0]], { strokeColor: C.aiStroke }))

  e.push(...layer('service_layer', 45, 370, 2130, 360, 'Hexagonal service boundaries'))
  const serviceSpecs = [
    ['identity', 75, 'Identity / RBAC Service', 'POST /auth/login\nJWT introspection', 'Account, Session,\nRolePolicy use cases', 'UserRepo · SessionStore\nTokenSigner'],
    ['search', 410, 'Search Service', 'GET /events/search\nGET /events/suggest', 'FacetedSearch\nDiscoveryQuery', 'SearchIndex · Cache\nReadModelConsumer'],
    ['booking', 745, 'Booking Service', 'Reservations API\nOrganizer event API', 'ReserveSeats\nConfirmBooking\nNoDoubleSell policy', 'BookingRepo · Outbox\nPaymentPort · MediaPort'],
    ['payment', 1080, 'Payment Service', 'Payment intents API\nPSP webhook API', 'AuthorizePayment\nRefund/Reconcile', 'PaymentRepo · PSPGateway\nEventPublisher'],
    ['ticket', 1415, 'Ticket Service', 'Tickets API\nCheck-in scan API', 'IssueTicket\nValidateSignedQR\nDetectDuplicateScan', 'TicketRepo · QRSigner\nEventPublisher'],
    ['notify', 1750, 'Notification Service', 'Event consumer\nAdmin resend API', 'SendTicketEmail\nSMS retry policy', 'DeliveryRepo · Email/SMS\nTemplateRenderer'],
  ]
  for (const spec of serviceSpecs) {
    const [id, x, title, inbound, core, outbound] = spec
    const special = id === 'booking'
    e.push(...hexService(`${id}_service`, x, 420, 290, 270, title, inbound, core, outbound, {
      fill: special ? '#ecfdf5' : C.inactiveFill,
      stroke: special ? C.successStroke : C.primaryStroke,
      titleColor: special ? C.successStroke : C.title,
      coreFill: special ? C.successFill : C.successFill,
    }))
  }

  e.push(...layer('message_layer', 45, 770, 2130, 210, 'Event-driven coordination'))
  e.push(...boxWithText('event_bus', 590, 810, 960, 74, 'Event Bus + Transactional Outbox', 'booking.reservation_held · payment.succeeded · booking.confirmed · ticket.issued · ticket.scan_accepted · notification.failed', {
    fill: C.startFill,
    stroke: C.startStroke,
    titleColor: C.startStroke,
    titleSize: 22,
    detailSize: 14,
  }))
  e.push(...topicChip('topic_held', 170, 912, 'reservation.held'))
  e.push(...topicChip('topic_payment', 390, 912, 'payment.succeeded'))
  e.push(...topicChip('topic_booking', 610, 912, 'booking.confirmed'))
  e.push(...topicChip('topic_ticket', 830, 912, 'ticket.issued'))
  e.push(...topicChip('topic_scan', 1050, 912, 'scan.accepted'))
  e.push(...topicChip('topic_notify', 1270, 912, 'notification.failed', C.warningFill, C.warningStroke))
  e.push(...boxWithText('expiry_worker', 1600, 805, 230, 78, 'Expiry Worker', 'expires HELD holds\npublishes reservation.expired', { fill: C.decisionFill, stroke: C.decisionStroke, titleSize: 18, detailSize: 12 }))
  e.push(...boxWithText('cdc_worker', 1860, 805, 230, 78, 'CDC / Sync Job', 'outbox fan-out\nupdates read models', { fill: C.decisionFill, stroke: C.decisionStroke, titleSize: 18, detailSize: 12 }))

  e.push(...layer('data_layer', 45, 1025, 2130, 280, 'Data ownership and adapters'))
  const dbSpecs = [
    ['identity_db', 75, 'identity_db', 'users · roles · sessions'],
    ['search_read', 410, 'Search read model', 'Elasticsearch documents\nRedis query/detail cache'],
    ['booking_db', 745, 'booking_db', 'events · seats · tiers\navailability · reservations · bookings'],
    ['payment_db', 1080, 'payment_db', 'payment_intents · refunds\nPSP references only'],
    ['ticket_db', 1415, 'ticket_db', 'tickets · ticket_scans\nsigned QR token hashes'],
    ['notify_db', 1750, 'notification_db', 'templates · send_queue\ndelivery_log'],
  ]
  for (const [id, x, title, detail] of dbSpecs) {
    e.push(...dbBox(id, x, 1075, 290, 86, title, detail, {
      fill: id === 'booking_db' ? C.successFill : id === 'search_read' ? C.tertiaryFill : C.successFill,
      stroke: id === 'search_read' ? C.primaryStroke : C.successStroke,
      titleColor: id === 'search_read' ? C.title : C.successStroke,
    }))
  }
  e.push(...boxWithText('shared_redis', 350, 1210, 320, 58, 'Redis shared infra', 'rate limits · session TTL · availability/detail cache', { fill: C.errorFill, stroke: C.warningStroke, titleSize: 16, detailSize: 12, titleColor: C.warningStroke }))
  e.push(...boxWithText('minio', 800, 1210, 270, 58, 'MinIO', 'event images + media objects', { fill: C.tertiaryFill, stroke: C.primaryStroke, titleSize: 16, detailSize: 12 }))
  e.push(...boxWithText('psp', 1150, 1210, 300, 58, 'External PSP', 'Stripe · Adyen · PayOS · MoMo · ZaloPay', { fill: C.aiFill, stroke: C.aiStroke, titleSize: 16, detailSize: 12, titleColor: C.aiStroke }))
  e.push(...boxWithText('email_provider', 1530, 1210, 300, 58, 'Email / SMS Provider', 'ticket confirmation + delivery retry', { fill: C.aiFill, stroke: C.aiStroke, titleSize: 16, detailSize: 12, titleColor: C.aiStroke }))

  e.push(...layer('consistency_layer', 45, 1355, 2130, 190, 'Consistency, resilience, and operations'))
  e.push(...boxWithText('consistency', 100, 1395, 520, 90, 'Consistency model', 'Strong consistency: reserve/confirm inside booking_db transaction\nEventual consistency: search, cache, notifications, dashboards', { fill: C.successFill, stroke: C.successStroke, titleColor: C.successStroke, titleSize: 19, detailSize: 13 }))
  e.push(...boxWithText('resilience', 700, 1395, 520, 90, 'Resilience policy', 'timeouts · retry with jitter · idempotency keys\ncircuit breakers around PSP and providers', { fill: C.decisionFill, stroke: C.decisionStroke, titleColor: C.decisionStroke, titleSize: 19, detailSize: 13 }))
  e.push(...boxWithText('observability', 1300, 1395, 520, 90, 'Observability', 'OpenTelemetry traces · x-correlation-id everywhere\nstructured logs · metrics · health/readiness probes', { fill: C.aiFill, stroke: C.aiStroke, titleColor: C.aiStroke, titleSize: 19, detailSize: 13 }))
  e.push(...codeBox('event_payload', 1840, 1365, 290, 160, 'Event envelope', '{\n  eventId,\n  eventType,\n  version,\n  aggregateId,\n  correlationId,\n  occurredAt\n}'))

  // Routing to services.
  for (const [, x] of serviceSpecs) {
    e.push(arrow(`gateway_to_service_${x}`, 640, 258, [[0, 0], [0, 80], [x + 145 - 640, 160]], { strokeColor: C.aiStroke, strokeWidth: x === 745 ? 3 : 2 }))
  }
  // Sync orchestration.
  e.push(arrow('booking_calls_payment', 1035, 555, [[0, 0], [42, 0]], { strokeColor: C.successStroke, strokeWidth: 3 }))
  e.push(label('payment_call_label', 990, 525, 'create payment intent', { width: 180, strokeColor: C.successStroke, fontSize: 13 }))
  e.push(arrow('payment_result_booking', 1080, 608, [[0, 0], [-42, 0]], { strokeColor: C.successStroke, strokeStyle: 'dashed' }))
  e.push(arrow('gateway_to_ticket_scan', 640, 258, [[0, 0], [0, 105], [920, 255]], { strokeColor: C.aiStroke }))

  // Service to event bus.
  for (const [id, x] of serviceSpecs.map(([id, x]) => [id, x + 145])) {
    if (id === 'identity' || id === 'search') continue
    e.push(arrow(`${id}_publishes_events`, x, 690, [[0, 0], [950 - x, 118]], { strokeColor: C.startStroke, strokeStyle: 'dashed' }))
  }
  e.push(arrow('bus_to_notify', 1200, 884, [[0, 0], [690, -194]], { strokeColor: C.startStroke, strokeStyle: 'dashed' }))
  e.push(arrow('bus_to_expiry_worker', 1550, 847, [[0, 0], [50, 0]], { strokeColor: C.startStroke }))
  e.push(arrow('bus_to_cdc_worker', 1550, 847, [[0, 0], [310, 0]], { strokeColor: C.startStroke }))
  e.push(arrow('expiry_to_booking', 1715, 805, [[0, 0], [-820, -115]], { strokeColor: C.decisionStroke, strokeStyle: 'dashed' }))
  e.push(arrow('cdc_to_search', 1975, 805, [[0, 0], [-1420, -115]], { strokeColor: C.decisionStroke, strokeStyle: 'dashed' }))

  // Data adapters.
  for (const [, x] of serviceSpecs) {
    e.push(arrow(`service_to_data_${x}`, x + 145, 690, [[0, 0], [0, 383]], { strokeColor: x === 410 ? C.primaryStroke : C.successStroke, strokeStyle: 'dashed' }))
  }
  e.push(arrow('search_to_redis', 555, 1160, [[0, 0], [-45, 50]], { strokeColor: C.warningStroke, strokeStyle: 'dashed' }))
  e.push(arrow('booking_to_minio', 890, 1160, [[0, 0], [45, 50]], { strokeColor: C.primaryStroke, strokeStyle: 'dashed' }))
  e.push(arrow('payment_to_psp', 1225, 1160, [[0, 0], [75, 50]], { strokeColor: C.aiStroke, strokeStyle: 'dashed' }))
  e.push(arrow('notify_to_email', 1895, 1160, [[0, 0], [-215, 50]], { strokeColor: C.aiStroke, strokeStyle: 'dashed' }))

  // Visual anchors / timeline dots.
  const timeline = [
    [170, '1. Search stale-safe'],
    [390, '2. Reserve in transaction'],
    [610, '3. Payment callback'],
    [830, '4. Confirm booking'],
    [1050, '5. Issue ticket'],
    [1270, '6. Notify + sync'],
  ]
  for (const [x, txt] of timeline) {
    e.push(ellipse(`dot_${x}`, x - 8, 951, 16, 16, { strokeColor: C.primaryStroke, backgroundColor: C.primaryFill, strokeWidth: 1 }))
    e.push(label(`dot_label_${x}`, x - 60, 982, txt, { width: 150, fontSize: 12, strokeColor: C.body, textAlign: 'center' }))
  }
  e.push(line('timeline_line', 165, 959, [[0, 0], [1160, 0]], { strokeColor: C.primaryStroke, strokeWidth: 2 }))

  return wrap(e)
}

function wrap(elements) {
  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      gridSize: 20,
    },
    files: {},
  }
}

const hldDiagram = hld()
const systemDiagram = systemArchitecture()

writeFileSync(join(outDir, 'pulse-seat-hld.excalidraw'), `${JSON.stringify(hldDiagram, null, 2)}\n`, 'utf8')
writeFileSync(join(outDir, 'pulse-seat-system-architecture.excalidraw'), `${JSON.stringify(systemDiagram, null, 2)}\n`, 'utf8')
writeFileSync(join(outDir, 'pulse-seat-hld.excalidraw.svg'), renderSvg(hldDiagram), 'utf8')
writeFileSync(join(outDir, 'pulse-seat-system-architecture.excalidraw.svg'), renderSvg(systemDiagram), 'utf8')

function renderSvg(diagram) {
  const active = diagram.elements.filter((el) => !el.isDeleted)
  const box = active.reduce(
    (acc, el) => {
      if ((el.type === 'arrow' || el.type === 'line') && el.points) {
        for (const [px, py] of el.points) {
          acc.maxX = Math.max(acc.maxX, el.x + px)
          acc.maxY = Math.max(acc.maxY, el.y + py)
        }
      } else {
        acc.maxX = Math.max(acc.maxX, el.x + Math.abs(el.width || 0))
        acc.maxY = Math.max(acc.maxY, el.y + Math.abs(el.height || 0))
      }
      return acc
    },
    { maxX: 0, maxY: 0 },
  )
  const width = Math.ceil(box.maxX + 80)
  const height = Math.ceil(box.maxY + 80)
  const markers = [...new Set(active.filter((el) => el.type === 'arrow').map((el) => el.strokeColor))]
    .map((color) => {
      const id = markerId(color)
      return `<marker id="${id}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M2,2 L10,6 L2,10 Z" fill="${esc(color)}"/></marker>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${markers}</defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${active.map(renderElement).join('\n  ')}
</svg>
`
}

function renderElement(el) {
  if (el.type === 'rectangle') {
    return `<rect x="${el.x}" y="${el.y}" width="${Math.abs(el.width)}" height="${Math.abs(el.height)}" rx="12" ry="12" fill="${esc(el.backgroundColor || 'transparent')}" stroke="${esc(el.strokeColor)}" stroke-width="${el.strokeWidth || 1}"${dash(el)}/>`
  }
  if (el.type === 'ellipse') {
    return `<ellipse cx="${el.x + Math.abs(el.width) / 2}" cy="${el.y + Math.abs(el.height) / 2}" rx="${Math.abs(el.width) / 2}" ry="${Math.abs(el.height) / 2}" fill="${esc(el.backgroundColor || 'transparent')}" stroke="${esc(el.strokeColor)}" stroke-width="${el.strokeWidth || 1}"${dash(el)}/>`
  }
  if (el.type === 'line' || el.type === 'arrow') {
    const points = el.points.map(([px, py]) => `${el.x + px},${el.y + py}`).join(' ')
    const marker = el.type === 'arrow' && el.endArrowhead ? ` marker-end="url(#${markerId(el.strokeColor)})"` : ''
    return `<polyline points="${points}" fill="none" stroke="${esc(el.strokeColor)}" stroke-width="${el.strokeWidth || 1}" stroke-linecap="round" stroke-linejoin="round"${dash(el)}${marker}/>`
  }
  if (el.type === 'text') {
    const justify = el.verticalAlign === 'middle' ? 'center' : 'flex-start'
    const align = el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start'
    const weight = el.fontSize >= 17 ? 700 : 600
    return `<foreignObject x="${el.x}" y="${el.y}" width="${Math.abs(el.width)}" height="${Math.abs(el.height)}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:${justify};justify-content:${align};text-align:${el.textAlign};font-family:Inter,Arial,sans-serif;font-size:${el.fontSize}px;line-height:${el.lineHeight || 1.25};font-weight:${weight};color:${esc(el.strokeColor)};white-space:pre-wrap;overflow:hidden;">${escText(el.text)}</div></foreignObject>`
  }
  return ''
}

function dash(el) {
  if (el.strokeStyle === 'dashed') return ' stroke-dasharray="10 8"'
  if (el.strokeStyle === 'dotted') return ' stroke-dasharray="2 6"'
  return ''
}

function markerId(color) {
  return `arrow_${String(color).replace(/[^a-zA-Z0-9]/g, '')}`
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function escText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
