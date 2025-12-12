import { createClient } from '@supabase/supabase-js'

// 你的数据库地址
const supabaseUrl = 'https://xagupmltcbusoajjnstl.supabase.co'

// 你的数据库钥匙 (anon key)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ3VwbWx0Y2J1c29hampuc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjIyNjYsImV4cCI6MjA4MTEzODI2Nn0.BZTst-W9u36VlioqwgwLXctm2itqjcr323p3XXXSuF4'

// 创建并导出连接器
export const supabase = createClient(supabaseUrl, supabaseKey)