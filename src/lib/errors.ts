export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "SEAT_LIMIT"
  | "INVITE_INVALID"
  | "RATE_LIMITED"
  | "INTERNAL";

// Postgres SQLSTATE codes, forwarded verbatim as PostgrestError.code.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === UNIQUE_VIOLATION;
}
