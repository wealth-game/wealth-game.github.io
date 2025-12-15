import { createClient } from '@supabase/supabase-js'

// ❌ 原来的：
// const supabaseUrl = 'https://xagupmltcbusoajjnstl.supabase.co'

// ✅ 现在的 (示例，填你自己的 Worker 地址)：
const supabaseUrl = 'https://game-api.iloveweiqi.com' 

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ3VwbWx0Y2J1c29hampuc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjIyNjYsImV4cCI6MjA4MTEzODI2Nn0.BZTst-W9u36VlioqwgwLXctm2itqjcr323p3XXXSuF4'

export const supabase = createClient(supabaseUrl, supabaseKey)