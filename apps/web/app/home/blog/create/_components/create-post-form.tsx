'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

import { useCreateBlogPost } from '~/lib/graphql/hooks';

/**
 * Zod schema for blog post form validation
 */
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  body: z
    .string()
    .min(10, 'Body must be at least 10 characters')
    .max(10000, 'Body must be 10,000 characters or less'),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export function CreatePostForm() {
  const router = useRouter();
  const createPostMutation = useCreateBlogPost();

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      title: '',
      body: '',
    },
  });

  const onSubmit = async (data: CreatePostFormValues) => {
    try {
      const newPost = await createPostMutation.mutateAsync({
        title: data.title,
        body: data.body,
      });

      if (!newPost) {
        throw new Error('Failed to create blog post');
      }

      toast.success('Blog post created successfully!');
      
      // Redirect to the new post
      router.push(`/blog/${newPost.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create blog post. Please try again.',
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => {
            const titleLength = field.value?.length || 0;
            const isOverLimit = titleLength > 255;
            
            return (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter post title..."
                    {...field}
                    disabled={createPostMutation.isPending}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormMessage />
                  <span
                    className={`text-xs ${
                      isOverLimit
                        ? 'text-destructive'
                        : titleLength > 200
                          ? 'text-orange-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {titleLength}/255
                  </span>
                </div>
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => {
            const bodyLength = field.value?.length || 0;
            const isOverLimit = bodyLength > 10000;
            
            return (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your post content here..."
                    className="min-h-[300px]"
                    {...field}
                    disabled={createPostMutation.isPending}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormMessage />
                  <span
                    className={`text-xs ${
                      isOverLimit
                        ? 'text-destructive'
                        : bodyLength > 9000
                          ? 'text-orange-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {bodyLength}/10,000
                  </span>
                </div>
              </FormItem>
            );
          }}
        />

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createPostMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPostMutation.isPending || !form.formState.isValid}
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

