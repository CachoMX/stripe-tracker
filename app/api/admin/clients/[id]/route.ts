import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET single client details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require admin access
    requireAdmin(user?.id);

    const { id: clientId } = await params;

    // Fetch client data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch client stats
    const [transactionsResult, paymentLinksResult] = await Promise.all([
      supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('tenant_id', clientId),
      supabaseAdmin
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', clientId),
    ]);

    const totalRevenue = transactionsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const stats = {
      transactions: transactionsResult.data?.length || 0,
      paymentLinks: paymentLinksResult.count || 0,
      revenue: totalRevenue / 100, // Convert from cents
    };

    return NextResponse.json({
      client,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PATCH update client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require admin access
    requireAdmin(user?.id);

    const { id: clientId } = await params;
    const body = await request.json();

    const { email, subscription_plan, subscription_status } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (email !== undefined) updateData.email = email;
    if (subscription_plan !== undefined) updateData.subscription_plan = subscription_plan;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;

    // Update client
    const { data: updatedClient, error } = await supabaseAdmin
      .from('tenants')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ client: updatedClient });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require admin access
    requireAdmin(user?.id);

    const { id: clientId } = await params;

    // Delete related data first (transactions, payment_links, etc.)
    await Promise.all([
      supabaseAdmin.from('transactions').delete().eq('tenant_id', clientId),
      supabaseAdmin.from('payment_links').delete().eq('tenant_id', clientId),
      supabaseAdmin.from('checkout_sessions').delete().eq('tenant_id', clientId),
    ]);

    // Delete the client
    const { error } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', clientId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}
