/**
 * DISABLED — previously overwrote every vendor with Unsplash images + invented portfolio packages.
 * Do not re-enable against real vendor data.
 */
export async function GET() {
    return Response.json(
        {
            message:
                'enhance-vendors is disabled. It invented Unsplash images and fake portfolio prices and must not run against real data.',
        },
        { status: 410 }
    );
}
