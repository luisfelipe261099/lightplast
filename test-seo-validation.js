import http from 'http';

async function makeRequest(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });

        req.on('error', reject);
        req.end();
    });
}

async function testSEO() {
    console.log('🔍 SEO Validation Test\n');

    try {
        // Test 1: Homepage meta tags
        console.log('Test 1: Homepage Schema...');
        const home = await makeRequest('GET', '/');
        if (home.body.includes('"@type": "LocalBusiness"')) {
            console.log('  ✅ HomePagemeta tags OK\n');
        } else {
            console.log('  ❌ Homepage schema missing\n');
        }

        // Test 2: Blog Schema
        console.log('Test 2: Blog Page Schema...');
        const blog = await makeRequest('GET', '/blog.html');
        if (blog.body.includes('"@type": "Blog"')) {
            console.log('  ✅ Blog schema OK\n');
        } else {
            console.log('  ❌ Blog schema missing\n');
        }

        // Test 3: Sitemap
        console.log('Test 3: Sitemap.xml...');
        const sitemap = await makeRequest('GET', '/sitemap.xml');
        if (sitemap.body.includes('<?xml') && sitemap.body.includes('<urlset')) {
            const matches = sitemap.body.match(/<url>/g) || [];
            console.log(`  ✅ Sitemap valid with ${matches.length} URLs\n`);
        } else {
            console.log('  ❌ Sitemap invalid\n');
        }

        // Test 4: Robots.txt
        console.log('Test 4: Robots.txt...');
        const robots = await makeRequest('GET', '/robots.txt');
        if (robots.body.includes('Sitemap:')) {
            console.log('  ✅ Robots.txt configured\n');
        } else {
            console.log('  ❌ Robots.txt missing sitemap\n');
        }

        // Test 5: Product Schema
        console.log('Test 5: Product Schema...');
        const product = await makeRequest('GET', '/produto-saco-hospitalar-20l.html');
        if (product.body.includes('"@type": "Product"') && product.body.includes('"@type": "BreadcrumbList"')) {
            console.log('  ✅ Product schema with breadcrumbs OK\n');
        } else {
            console.log('  ❌ Product schema missing\n');
        }

        // Test 6: Blog Article Schema
        console.log('Test 6: Blog Article Schema...');
        const article = await makeRequest('GET', '/blog-coleta-seletiva-empresas.html');
        if (article.body.includes('"@type": "BlogPosting"')) {
            console.log('  ✅ BlogPosting schema OK\n');
        } else {
            console.log('  ❌ BlogPosting schema missing\n');
        }

        console.log('✅ SEO validation completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setTimeout(testSEO, 1000);
