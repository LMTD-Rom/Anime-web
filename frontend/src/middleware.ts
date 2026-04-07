import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
    const pathname = url.pathname

    // 1. Skip for static assets, API, and admin dashboard
    if (
        pathname.includes('/sukinime_dev') ||
        pathname.includes('/_next') ||
        pathname.includes('/api') ||
        pathname.includes('/favicon.ico')
    ) {
        return NextResponse.next()
    }

    // 2. Create a minimal client to check settings
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single()

    const isMaintenance = data?.value === 'true'

    // 3. Bidirectional Redirection
    if (isMaintenance) {
        // If ON and not on maintenance page -> redirect to maintenance
        if (!pathname.includes('/maintenance')) {
            return NextResponse.redirect(new URL('/maintenance', request.url))
        }
    } else {
        // If OFF and on maintenance page -> redirect back to HOME
        if (pathname.includes('/maintenance')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

// limit the paths significantly to improve performance
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
