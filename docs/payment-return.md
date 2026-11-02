# After the payment: send customers to the new site

The card form is the payment company's page (Hyp, formerly Yaad), embedded in the new site's payment screen.
Two things bring the customer to the new thank-you page. The first needs nothing from the store.

1. **Automatic.** The payment screen asks the store for the order's status every 3 seconds. When the store marks the
   order paid, the site opens `/order-confirmation` by itself.
2. **Instant (recommended).** After a successful payment the payment company sends the customer to the store's own
   "order received" page. Redirect that page to the new site, so nobody ever sees the old thank-you page.

## The store-side redirect

Add this as a snippet in WordPress (plugin "Code Snippets", or the child theme's `functions.php`). Change
`NEW_SITE` to the address where the new site lives. Until the domain moves, use the Vercel address; afterwards, the
final domain.

```php
add_action('template_redirect', function () {
    if (!function_exists('is_wc_endpoint_url') || !is_wc_endpoint_url('order-received')) {
        return;
    }
    $new_site = 'https://lashon-hara.vercel.app'; // NEW_SITE
    $order_id = absint(get_query_var('order-received'));
    $key      = isset($_GET['key']) ? sanitize_text_field(wp_unslash($_GET['key'])) : '';
    if (!$order_id || !$key) {
        return;
    }
    wp_redirect($new_site . '/order-confirmation?order_id=' . $order_id . '&key=' . rawurlencode($key), 302);
    exit;
});
```

The payment screen shows the card form inside a frame. When the payment company returns the customer to the
store's "order received" page, that page now redirects to the new site inside the frame. The new thank-you page
notices it is inside a frame and opens itself in the full window.

## Also check in the payment company's terminal

Success and failure return addresses (if the terminal has them) can stay as they are: the store's own pages.
The redirect above takes care of them.
