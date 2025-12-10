import { z } from 'zod/v3'

const messageSchema = z.object({
  id: z.string(),
  author: z.object({
    role: z.string(),
  }),
  create_time: z.number(),
  content: z.object({
    content_type: z.string(),
    parts: z.array(z.string()),
  }),
  metadata: z.object({
    selected_github_repos: z.array(z.any()),
    selected_all_github_repos: z.boolean(),
    serialization_metadata: z.object({
      custom_symbol_offsets: z.array(z.any()),
    }),
  }),
})

export const conversationSchema = z.object({
  action: z.string(),
  messages: z.array(messageSchema),
  conversation_id: z.string(),
  parent_message_id: z.string(),
  model: z.string(),
  timezone_offset_min: z.number(),
  timezone: z.string(),
  conversation_mode: z.object({
    kind: z.string(),
  }),
  enable_message_followups: z.boolean(),
  system_hints: z.array(z.any()),
  supports_buffering: z.boolean(),
  supported_encodings: z.array(z.string()),
  client_contextual_info: z.object({
    is_dark_mode: z.boolean(),
    time_since_loaded: z.number(),
    page_height: z.number(),
    page_width: z.number(),
    pixel_ratio: z.number(),
    screen_height: z.number(),
    screen_width: z.number(),
    app_name: z.string(),
  }),
  paragen_cot_summary_display_override: z.string(),
  force_parallel_switch: z.string(),
})
