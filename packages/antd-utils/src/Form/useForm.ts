import { useMemo, useCallback } from 'react';
import type { z } from 'zod';
import type { FormInstance } from 'antd';
import { zodToAntdRules } from './zodToAntdRules';

export interface UseFormReturn<T> {
  /** Per-field Ant Design rules derived from the Zod schema */
  rules: Record<string, any>;

  /**
   * Wraps your submit handler with Zod validation.
   * On success: calls handler with typed, parsed values.
   * On failure: sets field-level errors on the form.
   */
  handleSubmit: (handler: (values: T) => void | Promise<void>) => () => Promise<void>;

  /**
   * Manually trigger Zod validation and push errors into the form.
   * Returns the parsed value on success, null on failure.
   */
  validate: () => Promise<T | null>;
}

/**
 * Connect an Ant Design form to a Zod schema.
 *
 * ```tsx
 * const [form] = Form.useForm();
 * const { rules, handleSubmit } = useForm(form, loginSchema);
 *
 * <Form form={form} onFinish={handleSubmit(onLogin)}>
 *   <Form.Item name="email" rules={rules.email}>
 * ```
 */
export function useForm<T extends z.ZodSchema<any>>(
  form: FormInstance,
  schema: T,
): UseFormReturn<z.infer<T>> {
  const rules = useMemo(() => zodToAntdRules(schema), [schema]);

  const validate = useCallback(async (): Promise<z.infer<T> | null> => {
    const values = form.getFieldsValue(true);
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return result.data;
    }

    // Map Zod errors to Ant Design field errors (v3: .errors, v4: .issues)
    const issues = (result.error as any).errors ?? (result.error as any).issues ?? [];
    const fieldErrors = issues.map((err: any) => ({
      name: err.path as (string | number)[],
      errors: [err.message],
    }));

    form.setFields(fieldErrors);
    return null;
  }, [form, schema]);

  const handleSubmit = useCallback(
    (handler: (values: z.infer<T>) => void | Promise<void>) => {
      return async () => {
        const parsed = await validate();
        if (parsed !== null) {
          await handler(parsed);
        }
      };
    },
    [validate],
  );

  return { rules, handleSubmit, validate };
}
