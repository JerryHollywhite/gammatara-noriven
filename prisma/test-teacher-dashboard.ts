import { getTeacherDashboardData } from '../src/lib/data-service'

async function test() {
    console.log('Testing getTeacherDashboardData locally...\n')

    // Use the actual teacher user ID from database
    const userId = 'cmjp1x0w50000jj042vdf54jr'

    try {
        const result = await getTeacherDashboardData(userId)

        if (result) {
            console.log('✅ SUCCESS! Dashboard data:')
            console.log(JSON.stringify(result, null, 2))
        } else {
            console.log('❌ FAILED: getTeacherDashboardData returned null')
        }
    } catch (error) {
        console.error('❌ ERROR:', error)
        if (error instanceof Error) {
            console.error('Stack:', error.stack)
        }
    }
}

test()
