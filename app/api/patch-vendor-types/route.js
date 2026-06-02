import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import AdminLog from '@/lib/models/AdminLog';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';
import { LEGACY_VENDOR_TYPE_MAP } from '@/lib/vendorCategories';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isAdminRequest(request)) {
    return adminDeniedResponse();
  }

  try {
    await dbConnect();

    const details = [];
    let totalUpdated = 0;

    for (const [oldType, newType] of Object.entries(LEGACY_VENDOR_TYPE_MAP)) {
      const result = await Vendor.updateMany({ type: oldType }, { $set: { type: newType } });
      if (result.modifiedCount > 0) {
        details.push({ from: oldType, to: newType, count: result.modifiedCount });
        totalUpdated += result.modifiedCount;
      }
    }

    if (totalUpdated > 0) {
      AdminLog.log('patch', 'vendor-types', null, { totalUpdated, details });
    }

    return Response.json({
      success: true,
      updated: totalUpdated,
      details,
      message:
        totalUpdated > 0
          ? `עודכנו ${totalUpdated} ספקים לקטגוריות הנכונות`
          : 'לא נמצאו ספקים עם קטגוריות ישנות',
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return adminDeniedResponse();
  }

  try {
    await dbConnect();
    const legacyTypes = Object.keys(LEGACY_VENDOR_TYPE_MAP);
    const counts = {};

    for (const type of legacyTypes) {
      counts[type] = await Vendor.countDocuments({ type });
    }

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return Response.json({ legacyCounts: counts, total });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
