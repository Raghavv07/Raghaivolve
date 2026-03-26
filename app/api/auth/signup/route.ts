
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const signupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = signupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
        }

        const { name, email, password } = result.data;

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            console.error('Supabase signup error:', error);
            // Return 400 or 409 depending on error
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (data.session) {
            // User is signed in automatically (email confirmation disabled or not required)
            return NextResponse.json({ success: true, user: data.user });
        } else if (data.user) {
            // User created but needs email verification
            return NextResponse.json({ success: true, user: data.user, message: "Check your email to confirm account." });
        }

        return NextResponse.json({ error: 'Unknown signup error' }, { status: 500 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
