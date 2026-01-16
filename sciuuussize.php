<?php
/**
 * Plugin Name: Sciuuus Size
 * Description: A plugin to dynamically generate size guide links based on product-specific anchors.
 * Version: 1.0
 * Author: Damian
 * License: GPL2
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define color map with Italian names and labels for anchor
const SCIUUSSIZE_COLOR_MAP = array(
        'arancione' => ['hex' => '#FC7D06', 'label' => 'arancione'],
        'verde'     => ['hex' => '#009285', 'label' => 'verde'],
        'rosso'     => ['hex' => '#f40057', 'label' => 'rosso'],
        'giallo'     => ['hex' => '#FFD700', 'label' => 'giallo']
);


// Add a custom meta box for the size guide settings
function sciuuussize_add_meta_box() {
    add_meta_box(
            'size_guide_settings',
            __('Size Guide Settings', 'sciuuussize'),
            'sciuuussize_render_meta_box',
            'product',
            'side',
            'default'
    );
}

// Render the meta box fields
function sciuuussize_render_meta_box($post) {
    // Get existing values
    $size_guide_color = get_post_meta($post->ID, '_size_guide_color', true) ?: 'arancione'; // Default to arancione
    $size_guide_slug = get_post_meta($post->ID, '_size_guide_slug', true);

    ?>
    <label for="size_guide_color"><?php _e('Seleziona il colore della guida:', 'sciuuussize'); ?></label>
    <select id="size_guide_color" name="size_guide_color" style="width:100%; margin-bottom: 10px;">
        <?php foreach (SCIUUSSIZE_COLOR_MAP as $color => $data) : ?>
            <option value="<?php echo esc_attr($color); ?>" <?php selected($size_guide_color, $color); ?>>
                <?php echo ucfirst($color) . " ({$data['hex']})"; ?>
            </option>
        <?php endforeach; ?>
    </select>

    <label for="size_guide_slug"><?php _e('Inserisci lo slug della pagina (es: guida-alle-taglie)', 'sciuuussize'); ?></label>
    <input type="text" id="size_guide_slug" name="size_guide_slug" value="<?php echo esc_attr($size_guide_slug); ?>" style="width:100%;">
    <?php
}

// Save meta box fields
function sciuuussize_save_meta_box($post_id) {
    if (array_key_exists('size_guide_color', $_POST)) {
        update_post_meta($post_id, '_size_guide_color', sanitize_text_field($_POST['size_guide_color']));
    }

    if (array_key_exists('size_guide_slug', $_POST)) {
        update_post_meta($post_id, '_size_guide_slug', sanitize_text_field($_POST['size_guide_slug']));
    }
}

// Hooks for meta box
add_action('add_meta_boxes', 'sciuuussize_add_meta_box');
add_action('save_post', 'sciuuussize_save_meta_box');


// Shortcode to generate a styled size guide link with a color circle and Italian label
function sciuuussize_generate_link_shortcode($atts) {
    global $post;

    // Get the stored meta values
    $size_guide_color = get_post_meta($post->ID, '_size_guide_color', true) ?: 'arancione'; // Default to arancione
    $size_guide_slug = get_post_meta($post->ID, '_size_guide_slug', true);

    // Use default slug if none is set
    $size_guide_slug = !empty($size_guide_slug) ? trim($size_guide_slug, '/') : 'guida-alle-taglie';

    // Get color hex and label based on selection
    $color_data = SCIUUSSIZE_COLOR_MAP[$size_guide_color] ?? SCIUUSSIZE_COLOR_MAP['arancione'];
    $color_hex = $color_data['hex'];
    $color_label = $color_data['label']; // This will be used for the anchor

    // Construct the base URL using the stored or default page slug and color label as anchor
    $base_url = site_url('/' . $size_guide_slug . '/');
    $final_url = rtrim($base_url, '/') . '#' . $color_label;

    // Parse shortcode attributes (removing 'url' override)
    $atts = shortcode_atts(
            array(
                    'text'  => 'Clicca qui!', // Default link text
                    'emoji' => 'show', // Show emoji by default
            ),
            $atts,
            'size_guide_link'
    );

    // Optional emoji HTML
    $emoji_html = '';
    if ($atts['emoji'] !== 'hide') {
        $emoji_html = '<img class="emoji" role="img" draggable="false" src="https://s.w.org/images/core/emoji/14.0.0/svg/1f914.svg" alt="🤔" />';
    }

    // Color circle (20px size, properly aligned)
    $color_circle = '<span style="display: inline-block; width: 20px; height: 20px; background-color: ' . esc_attr($color_hex) . '; border-radius: 50%; vertical-align: middle; margin-left: 8px;"></span>';

    // Return the styled HTML output
    return '<i>' . $emoji_html . ' Dubbi sulla taglia? <a href="' . esc_url($final_url) . '">' . esc_html($atts['text']) . '</a>' . $color_circle . ' <span style="color:' . esc_attr($color_hex) . '; vertical-align: middle;">Usa guida ' . esc_html($color_label) . '</span></i>';
}

add_shortcode('size_guide_link', 'sciuuussize_generate_link_shortcode');





// Allow shortcodes in Elementor placeholders
function sciuuussize_parse_elementor_placeholder($content) {
    return do_shortcode($content);
}

add_filter('widget_text', 'sciuuussize_parse_elementor_placeholder');
add_filter('widget_text_content', 'sciuuussize_parse_elementor_placeholder');


// Register product meta for REST API access (needed by Gutenberg editor)
function sciuuussize_register_product_meta() {
    register_post_meta('product', '_size_guide_color', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'default' => 'arancione',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));

    register_post_meta('product', '_size_guide_slug', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
}
add_action('init', 'sciuuussize_register_product_meta');


// Register Gutenberg Block for Size Guide Modal
function sciuuussize_register_size_guide_block() {
    // Register the block
    register_block_type(__DIR__ . '/blocks/size-guide-modal');

    // Make shoe sizes data available to JavaScript
    wp_localize_script(
        'sciuuussize-size-guide-modal-view-script',
        'sciuusSizeData',
        array(
            'jsonUrl' => plugin_dir_url(__FILE__) . 'data/shoe-sizes.json',
            'colorMap' => SCIUUSSIZE_COLOR_MAP
        )
    );
}
add_action('init', 'sciuuussize_register_size_guide_block');
