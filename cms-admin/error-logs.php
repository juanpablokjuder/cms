<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
$user = getCurrentUser();
$parts = explode(' ', $user['name'] ?? '');
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
$currentPage = 'error-logs';
$headerTitle = 'Log de Errores';
$pageTitle = 'Log de Errores';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php require_once __DIR__ . '/includes/head.php'; ?>
    <style>
        .log-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: var(--radius-full);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: .04em;
        }

        .log-badge.error {
            background: color-mix(in srgb, var(--color-danger) 15%, transparent);
            color: var(--color-danger);
        }

        .log-badge.warn {
            background: color-mix(in srgb, #f59e0b 15%, transparent);
            color: #b45309;
        }

        .log-badge.info {
            background: color-mix(in srgb, var(--color-info) 15%, transparent);
            color: var(--color-info);
        }

        .log-stack {
            font-family: monospace;
            font-size: var(--font-size-xs);
            white-space: pre-wrap;
            word-break: break-all;
            background: var(--color-surface-2);
            border-radius: var(--radius-md);
            padding: var(--space-3);
            max-height: 260px;
            overflow-y: auto;
            margin-top: var(--space-2);
        }

        .log-json {
            font-family: monospace;
            font-size: var(--font-size-xs);
            white-space: pre-wrap;
            word-break: break-all;
            background: var(--color-surface-2);
            border-radius: var(--radius-md);
            padding: var(--space-3);
        }

        .filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-3);
            align-items: flex-end;
            padding: var(--space-4);
            border-bottom: 1px solid var(--color-border);
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
        }

        .filter-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-secondary);
        }

        .log-detail-section {
            margin-bottom: var(--space-4);
        }

        .log-detail-section h4 {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
            margin-bottom: var(--space-2);
        }
    </style>
</head>

<body>
    <div class="app-layout" id="app-layout">
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <?php require_once __DIR__ . '/includes/sidebar.php'; ?>
        <?php require_once __DIR__ . '/includes/header.php'; ?>

        <main class="main-content">
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="page-title">Log de Errores de la API</h2>
                    <p class="page-subtitle">Registro de excepciones capturadas por el servidor</p>
                </div>
            </div>

            <div class="card">
                <!-- Filtros -->
                <div class="filter-row">
                    <div class="filter-group">
                        <label class="filter-label" for="filter-level">Nivel</label>
                        <select id="filter-level" class="form-input" style="min-width:110px">
                            <option value="">Todos</option>
                            <option value="error">error</option>
                            <option value="warn">warn</option>
                            <option value="info">info</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label class="filter-label" for="filter-status">HTTP Status</label>
                        <input type="number" id="filter-status" class="form-input" placeholder="ej: 500"
                            style="width:110px" min="100" max="599">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label" for="filter-code">Código de error</label>
                        <input type="text" id="filter-code" class="form-input" placeholder="ej: NOT_FOUND"
                            style="width:160px" maxlength="100">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label" for="filter-from">Desde</label>
                        <input type="datetime-local" id="filter-from" class="form-input">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label" for="filter-to">Hasta</label>
                        <input type="datetime-local" id="filter-to" class="form-input">
                    </div>
                    <button type="button" class="btn btn-primary" id="btn-apply-filters">Filtrar</button>
                    <button type="button" class="btn btn-secondary" id="btn-clear-filters">Limpiar</button>
                </div>

                <!-- Tabla -->
                <div class="table-wrapper">
                    <table class="data-table" id="logs-table">
                        <thead>
                            <tr>
                                <th style="width:70px">Nivel</th>
                                <th style="width:60px">Status</th>
                                <th style="width:130px">Tipo</th>
                                <th style="width:140px">Código</th>
                                <th>Mensaje</th>
                                <th style="width:90px">Método</th>
                                <th style="width:150px">Fecha</th>
                                <th style="width:60px"></th>
                            </tr>
                        </thead>
                        <tbody id="logs-tbody"></tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <div class="pagination">
                        <span class="pagination-info" id="logs-pagination-info">Cargando...</span>
                        <div class="pagination-controls">
                            <button class="pagination-btn" id="logs-pagination-prev" disabled>←</button>
                            <div id="logs-pagination-numbers"></div>
                            <button class="pagination-btn" id="logs-pagination-next" disabled>→</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Detail Modal -->
    <div class="modal-backdrop" id="detail-modal">
        <div class="modal" style="max-width:720px;max-height:90vh;overflow-y:auto">
            <div class="modal-header">
                <h3 class="modal-title">Detalle del Error</h3>
                <button class="modal-close" data-modal-close aria-label="Cerrar">✕</button>
            </div>
            <div class="modal-body" id="detail-modal-body"></div>
        </div>
    </div>

    <script src="assets/js/toast.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/api.js"></script>
    <script>
        'use strict';

        (function () {
            let currentPage = 1;
            const limit = 50;

            function getFilters() {
                const level = document.getElementById('filter-level').value;
                const status = document.getElementById('filter-status').value;
                const code = document.getElementById('filter-code').value.trim();
                const from = document.getElementById('filter-from').value;
                const to = document.getElementById('filter-to').value;

                const params = { page: currentPage, limit };
                if (level) params.level = level;
                if (status) params.status_code = parseInt(status, 10);
                if (code) params.error_code = code;
                if (from) params.from = new Date(from).toISOString();
                if (to) params.to = new Date(to).toISOString();
                return params;
            }

            async function loadLogs() {
                const tbody = document.getElementById('logs-tbody');
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-tertiary)">Cargando...</td></tr>';

                try {
                    const result = await Api.getErrorLogs(getFilters());
                    renderTable(result.data.data);
                    renderPagination(result.data.meta);
                } catch (err) {
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--color-danger)">Error al cargar logs: ${err.message}</td></tr>`;
                }
            }

            function levelBadge(level) {
                return `<span class="log-badge ${level}">${level}</span>`;
            }

            function renderTable(logs) {
                const tbody = document.getElementById('logs-tbody');
                if (!logs.length) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-tertiary)">Sin registros.</td></tr>';
                    return;
                }
                tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${levelBadge(log.level)}</td>
                <td><code>${log.status_code ?? '—'}</code></td>
                <td style="font-size:var(--font-size-xs)">${esc(log.error_type)}</td>
                <td style="font-size:var(--font-size-xs)">${esc(log.error_code ?? '—')}</td>
                <td style="font-size:var(--font-size-xs);max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(log.message)}">${esc(log.message)}</td>
                <td><code style="font-size:var(--font-size-xs)">${esc(log.http_method ?? '—')}</code></td>
                <td style="font-size:var(--font-size-xs)">${formatDate(log.created_at)}</td>
                <td>
                    <button type="button" class="btn btn-secondary" style="padding:4px 10px;font-size:var(--font-size-xs)"
                            onclick="showDetail(${JSON.stringify(JSON.stringify(log))})">Ver</button>
                </td>
            </tr>
        `).join('');
            }

            window.showDetail = function (logJson) {
                const log = JSON.parse(logJson);
                const body = document.getElementById('detail-modal-body');

                const section = (title, content) => content
                    ? `<div class="log-detail-section"><h4>${title}</h4>${content}</div>`
                    : '';

                const jsonBlock = (v) => {
                    if (!v) return null;
                    try { return `<div class="log-json">${esc(JSON.stringify(JSON.parse(v), null, 2))}</div>`; }
                    catch { return `<div class="log-json">${esc(v)}</div>`; }
                };

                body.innerHTML = `
            <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-4)">
                ${levelBadge(log.level)}
                <code>${log.status_code ?? '—'}</code>
                <code>${esc(log.error_type)}</code>
                ${log.error_code ? `<code>${esc(log.error_code)}</code>` : ''}
            </div>

            ${section('Mensaje', `<p style="font-size:var(--font-size-sm)">${esc(log.message)}</p>`)}

            ${section('Request', log.http_method ? `
                <p style="font-size:var(--font-size-xs);margin-bottom:4px">
                    <strong>${esc(log.http_method)}</strong>
                    ${esc(log.url ?? '')}
                    ${log.route ? `<br><span style="color:var(--color-text-tertiary)">Ruta: ${esc(log.route)}</span>` : ''}
                </p>
            ` : null)}

            ${section('Identificación', `
                <p style="font-size:var(--font-size-xs)">
                    IP: <code>${esc(log.ip_address ?? '—')}</code><br>
                    Usuario: <code>${esc(log.user_uuid ?? 'Anónimo')}</code> ${log.user_role ? `(${esc(log.user_role)})` : ''}<br>
                    Servidor: <code>${esc(log.hostname ?? '—')}</code> · Entorno: <code>${esc(log.node_env ?? '—')}</code><br>
                    Fecha: ${formatDate(log.created_at)}
                </p>
            `)}

            ${section('Body de la Request', jsonBlock(log.request_body))}
            ${section('Parámetros de Ruta', jsonBlock(log.request_params))}
            ${section('Query String', jsonBlock(log.request_query))}
            ${section('Contexto adicional', jsonBlock(log.context))}

            ${log.stack_trace ? section('Stack Trace', `<div class="log-stack">${esc(log.stack_trace)}</div>`) : ''}
        `;

                document.getElementById('detail-modal').classList.add('active');
            };

            function renderPagination(meta) {
                const { total, page, limit, totalPages } = meta;

                document.getElementById('logs-pagination-info').textContent =
                    `${((page - 1) * limit) + 1}–${Math.min(page * limit, total)} de ${total}`;

                document.getElementById('logs-pagination-prev').disabled = page <= 1;
                document.getElementById('logs-pagination-next').disabled = page >= totalPages;

                const numbersEl = document.getElementById('logs-pagination-numbers');
                numbersEl.innerHTML = '';
                const start = Math.max(1, page - 2);
                const end = Math.min(totalPages, page + 2);
                for (let p = start; p <= end; p++) {
                    const btn = document.createElement('button');
                    btn.className = `pagination-btn${p === page ? ' active' : ''}`;
                    btn.textContent = p;
                    btn.addEventListener('click', () => { currentPage = p; loadLogs(); });
                    numbersEl.appendChild(btn);
                }
            }

            function formatDate(iso) {
                if (!iso) return '—';
                return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'medium' });
            }

            function esc(str) {
                if (!str && str !== 0) return '';
                const d = document.createElement('div');
                d.textContent = String(str);
                return d.innerHTML;
            }

            // ── Eventos ──────────────────────────────────────────────────────────────
            document.getElementById('btn-apply-filters').addEventListener('click', () => { currentPage = 1; loadLogs(); });
            document.getElementById('btn-clear-filters').addEventListener('click', () => {
                ['filter-level', 'filter-status', 'filter-code', 'filter-from', 'filter-to']
                    .forEach(id => { document.getElementById(id).value = ''; });
                currentPage = 1;
                loadLogs();
            });
            document.getElementById('logs-pagination-prev').addEventListener('click', () => { currentPage--; loadLogs(); });
            document.getElementById('logs-pagination-next').addEventListener('click', () => { currentPage++; loadLogs(); });

            // ── Modal close ──────────────────────────────────────────────────────────
            document.querySelectorAll('[data-modal-close]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('detail-modal').classList.remove('active');
                });
            });
            document.getElementById('detail-modal').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
            });

            // ── Init ─────────────────────────────────────────────────────────────────
            document.addEventListener('DOMContentLoaded', loadLogs);
        })();
    </script>
    <?php require_once __DIR__ . '/includes/layout-scripts.php'; ?>
</body>

</html>