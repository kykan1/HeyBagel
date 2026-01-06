import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getEntryById } from "@/lib/db/queries";
import { EntryForm } from "@/components/EntryForm";
import { updateEntry } from "@/actions/entry-actions";
import { auth } from "@/lib/auth/config";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

interface EditEntryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditEntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return {
      title: "Entry Not Found - Hey Bagel",
      description: "Please sign in to edit this entry.",
    };
  }
  
  const entry = await getEntryById(id, session.user.id);

  if (!entry) {
    return {
      title: "Entry Not Found - Hey Bagel",
      description: "This journal entry could not be found.",
    };
  }

  return {
    title: `Edit Entry from ${formatDate(entry.date)} - Hey Bagel`,
    description: "Edit your journal entry",
  };
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  
  const entry = await getEntryById(id, session.user.id);

  if (!entry) {
    notFound();
  }

  async function updateEntryAction(formData: FormData) {
    "use server";
    const result = await updateEntry(id, formData);
    
    if (result.success) {
      redirect(`/entries/${id}`);
    } else {
      throw new Error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/entries/${id}`}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            ← Cancel
          </Link>
          <div className="text-xs text-gray-500 hidden sm:block">
            Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono text-xs">Esc</kbd> to cancel
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Entry</h1>
        <p className="text-gray-600">
          Update your journal entry from {formatDate(entry.date)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <EntryForm
          action={updateEntryAction}
          initialContent={entry.content}
          initialMood={entry.mood}
          submitLabel="Save Changes"
        />
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1 text-sm">
            <p className="text-blue-900 font-medium mb-1">Note about AI insights</p>
            <p className="text-blue-800">
              Editing this entry will not automatically regenerate AI insights. 
              You can manually regenerate insights from the entry detail page after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


