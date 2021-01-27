const host:string = "http://localhost:8088/"

export async function http<T>(
  request: RequestInfo
): Promise<T> {
  const response = await fetch(host+request);
  const body = await response.json();
  return body;
}