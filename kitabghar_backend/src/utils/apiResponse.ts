import type { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  status = 200,
  meta?: PaginationMeta
) {
  const body: Record<string, unknown> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function sendError(res: Response, message = "Error", status = 500) {
  return res.status(status).json({ success: false, message, data: null });
}