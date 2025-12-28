import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// POST /api/upload/forum-image - Upload forum image
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size (1MB = 1048576 bytes)
        const maxSize = 1048576; // 1MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File size exceeds 1MB limit',
                maxSize: '1MB',
                fileSize: `${(file.size / 1048576).toFixed(2)}MB`
            }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed'
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `forum-${timestamp}.${extension}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads/forum directory
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'forum');
        const filePath = join(uploadDir, filename);

        // Create directory if it doesn't exist
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/forum/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });

    } catch (error) {
        console.error('Error uploading forum image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
