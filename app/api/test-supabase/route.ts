import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("🔍 Testing Supabase configuration...");
    console.log("URL:", supabaseUrl);
    console.log("Anon Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing");
    console.log("Service Key:", supabaseServiceKey ? "✅ Set" : "❌ Missing");

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Supabase credentials missing",
        details: {
          url: !!supabaseUrl,
          anonKey: !!supabaseAnonKey,
          serviceKey: !!supabaseServiceKey,
        }
      }, { status: 500 });
    }

    // Try with service role key if available, otherwise anon key
    const keyToUse = supabaseServiceKey || supabaseAnonKey;
    const supabase = createClient(supabaseUrl, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log("Using key type:", supabaseServiceKey ? "SERVICE_ROLE" : "ANON");

    // Test 1: List buckets
    console.log("📦 Testing bucket access...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Buckets error:", bucketsError);
      return NextResponse.json({
        success: false,
        error: "Failed to list buckets",
        details: bucketsError,
      }, { status: 500 });
    }

    console.log("✅ Buckets found:", buckets?.map(b => b.name));

    // Test 2: Check if receipts bucket exists
    const receiptsBucket = buckets?.find(b => b.name === 'receipts');
    
    if (!receiptsBucket) {
      return NextResponse.json({
        success: false,
        error: "Receipts bucket not found",
        availableBuckets: buckets?.map(b => b.name) || [],
        message: "Please create a 'receipts' bucket in Supabase Storage",
      }, { status: 404 });
    }

    // Test 3: Try to upload a test file
    console.log("📤 Testing file upload...");
    const testContent = "Test file content";
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return NextResponse.json({
        success: false,
        error: "Failed to upload test file",
        details: uploadError,
        bucket: receiptsBucket,
      }, { status: 500 });
    }

    console.log("✅ Upload successful:", uploadData);

    // Test 4: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(testFileName);

    console.log("🔗 Public URL:", publicUrl);

    // Test 5: Delete test file
    const { error: deleteError } = await supabase.storage
      .from('receipts')
      .remove([testFileName]);

    if (deleteError) {
      console.warn("⚠️  Could not delete test file:", deleteError);
    }

    return NextResponse.json({
      success: true,
      message: "Supabase Storage is working correctly!",
      details: {
        url: supabaseUrl,
        bucketsFound: buckets?.length || 0,
        receiptsBucket: receiptsBucket.name,
        testUpload: "✅ Success",
        publicUrl,
      }
    });

  } catch (error: any) {
    console.error("❌ Test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      stack: error.stack,
    }, { status: 500 });
  }
}

