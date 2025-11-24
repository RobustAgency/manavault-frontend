"use client";

import { CreateLoginLogData } from '@/lib/redux/features';

/**
 * Get user's IP address using a public API
 * Falls back to 'unknown' if the API call fails
 */
async function getUserIPAddress(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        return 'unknown';
    }
}

/**
 * Get user agent from browser
 */
function getUserAgent(): string | null {
    if (typeof window === 'undefined') return null;
    return window.navigator.userAgent || null;
}

/**
 * Create login log data object
 * This should be called after successful login
 */
export async function createLoginLogData(
    email: string,
    activity: string = 'login'
): Promise<CreateLoginLogData> {
    const ipAddress = await getUserIPAddress();
    const userAgent = getUserAgent();

    return {
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        activity,
        logged_in_at: new Date().toISOString(),
    };
}
