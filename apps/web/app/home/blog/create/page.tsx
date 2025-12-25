import { PageBody, PageHeader } from '@kit/ui/page';

import { CreatePostForm } from './_components/create-post-form';

export default function CreatePostPage() {
  return (
    <>
      <PageHeader
        title="Create New Post"
        description="Share your thoughts with the community"
      />

      <PageBody>
        <div className="max-w-3xl">
          <CreatePostForm />
        </div>
      </PageBody>
    </>
  );
}

