'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface NewRfpFormProps {
  onSubmit: (url: string) => Promise<void>;
}

export function NewRfpForm({ onSubmit }: NewRfpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const [scanStatus, setScanStatus] = useState('');

  async function handleSubmit(data: FormValues) {
    setIsLoading(true);
    setScanStatus(`Scanning ${data.url} for RFP keywords...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await onSubmit(data.url);
    setIsLoading(false);
    setScanStatus('');
    form.reset();
  }

  if (!isClient) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full items-start gap-2">
        <div className="relative flex-grow">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Target URL" {...field} className="pl-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {scanStatus && <span className="text-xs whitespace-nowrap">{scanStatus}</span>}
            </div>
          ) : 'Analyze'}
        </Button>
      </form>
    </Form>
  );
}
