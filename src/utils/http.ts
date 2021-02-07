const host:string = "http://192.168.1.64:8088/"

export async function http<T>(
  request: RequestInfo
): Promise<T> {
  const response = await fetch(host+request);
  const body = await response.json();
  return body;
}