// js/products-loader.js
const ProductsLoader = {
    
    async getAll() {
        if (!window.supabaseClient) {
            console.error('Supabase client not ready');
            return [];
        }
        
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Error loading products:', error.message);
            return [];
        }
        
        console.log(`✅ Loaded ${data?.length || 0} products from database`);
        return data || [];
    },
    
    async search(query) {
        if (!window.supabaseClient) return [];
        
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
            .order('id', { ascending: true });
        
        if (error) return [];
        return data || [];
    },
    
    createCard(product) {
        const imgSrc = product.image_url || '../CourtsideHoops/images/default.png';
        
        return `
            <div class="card" 
                 data-id="${product.id}"
                 data-name="${product.name}"
                 data-price="${product.price}"
                 data-price-display="₱${parseFloat(product.price).toLocaleString()}"
                 data-rarity="${product.rarity}"
                 data-img="${imgSrc}">
                
                <img src="${imgSrc}" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/150?text=NBA'">
                <h4>${product.name}</h4>
                <p>₱${parseFloat(product.price).toLocaleString()}</p>
                <button class="add-btn">Add to Cart</button>
            </div>
        `;
    },
    
    async renderToContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<p style="text-align:center;padding:40px;">Loading products...</p>';
        
        const products = await this.getAll();
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No products in database.</p>';
            return;
        }
        
        container.innerHTML = products.map(p => this.createCard(p)).join('');
        
        // Re-init modal after rendering
        if (typeof initModal === 'function') {
            initModal();
        }
        
        // Re-bind cart buttons
        if (typeof CourtsideCart !== 'undefined') {
            CourtsideCart.bindAddToCartButtons();
        }
        
        return products;
    }
};