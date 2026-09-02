<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Education',
                'slug'        => 'education',
                'description' => 'Online learning platforms, courses, and skill development subscriptions.',
                'image_url'   => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
            ],
            [
                'name'        => 'Streaming',
                'slug'        => 'streaming',
                'description' => 'Premium streaming service subscriptions for music, video, and sports.',
                'image_url'   => 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&q=80',
            ],
            [
                'name'        => 'AI Products',
                'slug'        => 'ai-products',
                'description' => 'AI-powered tools, chat assistants, image generators, and productivity AI.',
                'image_url'   => 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
            ],
            [
                'name'        => 'Dev & Design',
                'slug'        => 'dev-design',
                'description' => 'Developer tools, design software, and creative professional subscriptions.',
                'image_url'   => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
            ],
            [
                'name'        => 'Productivity',
                'slug'        => 'productivity',
                'description' => 'Workspace, writing, and productivity tools to get more done.',
                'image_url'   => 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
            ],
            [
                'name'        => 'VPN & Security',
                'slug'        => 'vpn-security',
                'description' => 'VPN services, password managers, and cybersecurity tools.',
                'image_url'   => 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80',
            ],
            [
                'name'        => 'Gaming',
                'slug'        => 'gaming',
                'description' => 'Game passes, subscriptions, and gaming utilities.',
                'image_url'   => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
            ],
            [
                'name'        => 'Lifestyle',
                'slug'        => 'lifestyle',
                'description' => 'Health, wellness, social, and lifestyle subscriptions.',
                'image_url'   => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
            ],
            [
                'name'        => 'Reseller',
                'slug'        => 'reseller',
                'description' => 'Wholesale packages and reseller programs for digital subscriptions.',
                'image_url'   => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
