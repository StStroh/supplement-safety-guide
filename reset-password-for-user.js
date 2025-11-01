// Quick script to reset password for stefanstroh@msn.com
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword() {
  const email = 'stefanstroh@msn.com'
  const newPassword = 'ProAccess2024!'

  console.log(`Updating password for ${email}...`)

  // Update the user's password directly using admin API
  const { data, error } = await supabase.auth.admin.updateUserById(
    'ed4ad266-dead-4243-97f2-519705c101ae',
    { password: newPassword }
  )

  if (error) {
    console.error('Error updating password:', error)
    return
  }

  console.log('✅ Password updated successfully!')
  console.log('')
  console.log('LOGIN CREDENTIALS:')
  console.log('==================')
  console.log('Email:', email)
  console.log('Password:', newPassword)
  console.log('')
  console.log('Go to: https://supplementsafetybible.com/login')
}

resetPassword()
