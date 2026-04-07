import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * API endpoint for error reporting and management
 * 
 * POST /api/monitoring/errors
 * Manually report errors with context and categorization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

        if (!body || typeof body !== 'object') {
          return NextResponse.json(
            { error: 'Invalid JSON body provided' },
            { status: 400 }
          );
        }

    const { error, context, category, severity } = body;
    
    if (!error || !error.message) {
      return NextResponse.json(
        { error: 'Invalid error data provided' },
        { status: 400 }
      );
    }

    // Create error object from request data
    const errorObj = new Error(error.message);
    if (error.stack) {
      errorObj.stack = error.stack;
    }
    if (error.name) {
      errorObj.name = error.name;
    }

    // Report to Sentry with enhanced context
    Sentry.captureException(errorObj, {
      tags: {
        category: category || 'manual_report',
        severity: severity || 'medium',
        endpoint: '/api/monitoring/errors',
      },
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Track error reporting metrics
    Sentry.metrics.increment('errors.manual_reports', 1, {
      category: category || 'manual_report',
      severity: severity || 'medium',
    });

    // Add breadcrumb for manual error reporting
    Sentry.addBreadcrumb({
      message: `Manual Error Report: ${error.message}`,
      category: 'manual_error_report',
      level: 'warning',
      data: {
        category,
        severity,
        context,
      },
    });

    const errorId = Math.random().toString(36).substr(2, 9);

    return NextResponse.json({
      success: true,
      errorId,
      message: 'Error reported successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/monitoring/errors',
        action: 'report_error',
      },
    });

    return NextResponse.json(
      { 
        error: 'Failed to report error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/errors
 * Retrieve error statistics and recent errors (if available)
 */
export async function GET(request: NextRequest) {
  try {
    // This would typically fetch from a database or error tracking service
    // For now, return placeholder data that would come from Sentry
    
    const errorStats = {
      totalErrors: 0,
      errorRate: 0,
      categories: {
        network: 0,
        validation: 0,
        permission: 0,
        timeout: 0,
        type_error: 0,
        reference_error: 0,
        unknown: 0,
        manual_report: 0,
      },
      severity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      recentErrors: [],
      trends: {
        last24h: 0,
        last7d: 0,
        last30d: 0,
      },
    };

    // Track API metrics
    Sentry.metrics.timing('api.error_monitoring.duration', 0, {
      endpoint: '/api/monitoring/errors',
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      stats: errorStats,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/monitoring/errors',
        action: 'get_stats',
      },
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch error statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitoring/errors
 * Clear error data (use with caution - typically only for development)
 */
export async function DELETE(request: NextRequest) {
  try {
    // This would typically clear error data from database
    // For now, just log the action
    
    Sentry.addBreadcrumb({
      message: 'Error data cleared via API',
      category: 'error_management',
      level: 'info',
    });

    Sentry.metrics.increment('errors.data_cleared', 1, {
      endpoint: '/api/monitoring/errors',
    });

    return NextResponse.json({
      success: true,
      message: 'Error data cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/monitoring/errors',
        action: 'clear_errors',
      },
    });

    return NextResponse.json(
      { 
        error: 'Failed to clear error data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
