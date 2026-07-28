/**
 * DISABLED — previously deleted all vendors and re-seeded from data/vendors.json (demo catalog).
 * Do not re-enable against production/real vendor data.
 */
export async function GET() {
    return Response.json(
        {
            message:
                'seed-vendors is disabled. Use admin / scripts to add real vendors only. Demo vendors.json must not overwrite production data.',
        },
        { status: 410 }
    );
}
