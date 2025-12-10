import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear Stripe connection from tenant
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({
        stripe_account_id: null,
        stripe_secret_key: null,
        stripe_refresh_token: null,
      })
      .eq('clerk_user_id', user.id);

    if (updateError) {
      console.error('Error disconnecting Stripe:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Stripe account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
