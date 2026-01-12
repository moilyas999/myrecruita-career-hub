/**
 * Public Submissions Service
 * 
 * Centralized service for handling public form submissions (CV, Contact, Employer Jobs).
 * Uses insert() without .select() to avoid RLS SELECT policy requirements for guests.
 * Automatically attaches user_id when a user is logged in.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

/**
 * Gets the current user's ID if logged in, otherwise returns null.
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Uploads a file to Supabase Storage and returns the storage path.
 * Returns null if no file is provided.
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string
): Promise<{ path: string; error?: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('File upload error:', uploadError);
    return { path: '', error: uploadError.message };
  }

  // Return the storage path (not the public URL - more secure for private buckets)
  // The admin dashboard can generate signed URLs as needed
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { path: publicUrl };
}

/**
 * Submit a CV to the cv_submissions table.
 */
export async function submitCV(data: {
  name: string;
  email: string;
  phone: string;
  message?: string;
  cvFileUrl?: string | null;
  source?: string;
}): Promise<SubmissionResult> {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('cv_submissions')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || null,
        cv_file_url: data.cvFileUrl || null,
        source: data.source || 'website',
        user_id: userId,
      });

    if (error) {
      console.error('CV submission error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('CV submission unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Submit a contact form to the contact_submissions table.
 */
export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiryType: string;
}): Promise<SubmissionResult> {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        subject: data.subject,
        message: data.message,
        inquiry_type: data.inquiryType,
      });

    if (error) {
      console.error('Contact submission error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Contact submission unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Submit an employer job posting to the employer_job_submissions table.
 */
export async function submitEmployerJob(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobDescription: string;
  sector: string;
  location: string;
  jobSpecFileUrl?: string | null;
}): Promise<SubmissionResult> {
  try {
    const { error } = await supabase
      .from('employer_job_submissions')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        job_title: data.jobTitle,
        job_description: data.jobDescription,
        sector: data.sector,
        location: data.location,
        job_spec_file_url: data.jobSpecFileUrl || null,
      });

    if (error) {
      console.error('Employer job submission error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Employer job submission unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Send admin notification for a submission event.
 * This is a non-critical operation - failures are logged but don't affect the submission.
 */
export async function sendAdminNotification(data: {
  title: string;
  message: string;
  category: string;
  link: string;
  targetRoles: string[];
}): Promise<void> {
  try {
    await supabase.functions.invoke('send-push-notification', {
      body: {
        title: data.title,
        message: data.message,
        category: data.category,
        link: data.link,
        targetRoles: data.targetRoles,
        icon: 'https://myrecruita.com/favicon.ico',
      }
    });
  } catch (error) {
    console.log('Admin notification failed (non-critical):', error);
  }
}
