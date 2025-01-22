import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const TARGET_SERVER = process.env.NEXTAPI_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  return await handleProxy(req);
}

export async function POST(req: NextRequest) {
  return await handleProxy(req);
}

export async function PUT(req: NextRequest) {
  return await handleProxy(req);
}

export async function DELETE(req: NextRequest) {
  return await handleProxy(req);
}

export async function PATCH(req: NextRequest) {
  return await handleProxy(req);
}

// 通用代理处理函数
async function handleProxy(req: NextRequest): Promise<NextResponse> {
  // 解析目标路径
  let targetPath = req.nextUrl.pathname.replace('/api/proxy', '');

  // 如果路径不以 '/' 结尾，则添加 '/'
  if (!targetPath.endsWith('/')) {
    targetPath += '/';
  }

  // 构造完整的目标 URL
  let targetUrl = `${TARGET_SERVER}${targetPath}`;

  // 拼接查询参数
  const searchParams = req.nextUrl.search;
  if (searchParams) {
    targetUrl += searchParams;
  }

  console.log(`[PROXY] Forwarding Request: ${req.method} ${targetUrl}`);

  const headers = new Headers(req.headers);
  headers.set('X-Forwarded-Host', req.nextUrl.host || '');
  headers.set('X-Forwarded-For', req.headers.get('x-forwarded-for') || '');
  headers.set('X-Forwarded-Proto', req.nextUrl.protocol || 'http');

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // 处理非 GET 和 HEAD 请求的请求体
  if (!['GET', 'HEAD'].includes(req.method || '')) {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      fetchOptions.body = JSON.stringify(await req.json());
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const formDataObj: Record<string, string> = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value.toString();
      });
      fetchOptions.body = new URLSearchParams(formDataObj).toString();
    } else if (await req.text()) {
      fetchOptions.body = await req.text();
    } else {
      fetchOptions.body = null;
    }
  }

  try {
    // 转发请求并获取目标服务器响应
    const proxyResponse = await fetch(targetUrl, fetchOptions);

    // 日志记录：目标服务器的返回状态及响应
    console.log(`[PROXY] Response Status: ${proxyResponse.status} from ${targetUrl}`);

    // 返回目标服务器的响应
    return new NextResponse(proxyResponse.body, {
      status: proxyResponse.status,
      headers: proxyResponse.headers,
    });
  } catch (error: any) {
    console.error(`[PROXY ERROR] Failed to proxy request: ${error.message}`);
    return NextResponse.json(
      { error: 'Proxy Failed', message: error.message },
      { status: 500 }
    );
  }
}
