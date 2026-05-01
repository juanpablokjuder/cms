import { db } from '../../database/connection.js';
import type { ErrorLogRow, ErrorLogFilters, PaginatedErrorLogs } from '../../shared/types/index.js';

const LOG_COLUMNS = `
  uuid, level, error_type, error_code, status_code, message, stack_trace,
  http_method, url, route, user_uuid, user_role, ip_address, user_agent,
  request_body, request_params, request_query, context, hostname, node_env, created_at
`.trim();

export class ErrorLogRepository {

  /**
   * Lista los registros de error con filtros opcionales y paginación.
   * El resultado se ordena por fecha descendente (más reciente primero).
   */
  async findAll(filters: ErrorLogFilters): Promise<PaginatedErrorLogs> {
    const { page, limit, level, statusCode, errorCode, from, to, userUuid } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[]    = [];

    if (level) {
      conditions.push('level = ?');
      params.push(level);
    }

    if (statusCode !== undefined) {
      conditions.push('status_code = ?');
      params.push(statusCode);
    }

    if (errorCode) {
      conditions.push('error_code = ?');
      params.push(errorCode);
    }

    if (userUuid) {
      conditions.push('user_uuid = ?');
      params.push(userUuid);
    }

    if (from) {
      conditions.push('created_at >= ?');
      params.push(from);
    }

    if (to) {
      conditions.push('created_at <= ?');
      params.push(to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contar total para la paginación
    const [{ total }] = await db.query<[{ total: number }]>(
      `SELECT COUNT(*) AS total FROM error_logs ${where}`,
      params,
    );

    // Obtener la página
    const rows = await db.query<ErrorLogRow[]>(
      `SELECT ${LOG_COLUMNS}
         FROM error_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene el detalle completo de un registro por UUID.
   */
  async findByUuid(uuid: string): Promise<ErrorLogRow> {
    const rows = await db.query<ErrorLogRow[]>(
      `SELECT ${LOG_COLUMNS} FROM error_logs WHERE uuid = ? LIMIT 1`,
      [uuid],
    );

    if (rows.length === 0) {
      const { AppError } = await import('../../shared/utils/app-error.js');
      throw AppError.notFound('ErrorLog');
    }

    return rows[0] as ErrorLogRow;
  }

  /**
   * Elimina registros anteriores a la fecha indicada.
   * Útil para tareas de mantenimiento / retención de datos.
   */
  async deleteBefore(date: Date): Promise<number> {
    const result = await db.query<{ affectedRows: number }>(
      `DELETE FROM error_logs WHERE created_at < ?`,
      [date],
    );
    return result.affectedRows;
  }
}
