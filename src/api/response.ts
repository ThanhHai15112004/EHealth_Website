export function unwrap<T>(res: any): T {
  return res?.data?.data ?? res?.data ?? res;
}

export function unwrapList<T>(res: any): { data: T[]; pagination?: any } {
  const nested = res?.data?.data;
  const raw = Array.isArray(nested)
    ? nested
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
          ? res.data
          : [];
  const pagination = nested?.pagination ?? res?.data?.pagination ?? res?.pagination;
  return { data: Array.isArray(raw) ? raw : [], pagination };
}

export function extractErrorMessage(error: any): string {
  return error?.response?.data?.message
    ?? error?.response?.data?.error
    ?? error?.message
    ?? "Có lỗi không xác định xảy ra";
}
