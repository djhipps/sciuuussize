<?php
/**
 * Size Guide Modal Block - Frontend Rendering
 *
 * @var array    $attributes Block attributes
 * @var string   $content    Block default content
 * @var WP_Block $block      Block instance
 */

// Get the current post ID
$post_id = get_the_ID();

// Get the size guide color from product meta
$size_guide_color = get_post_meta($post_id, '_size_guide_color', true);
if (empty($size_guide_color)) {
    $size_guide_color = 'arancione'; // Default
}

// Get color data from the color map
$color_map = array(
    'arancione' => array('hex' => '#FC7D06', 'label' => 'arancione'),
    'verde'     => array('hex' => '#009285', 'label' => 'verde'),
    'rosso'     => array('hex' => '#f40057', 'label' => 'rosso'),
    'giallo'    => array('hex' => '#FFD700', 'label' => 'giallo'),
    'blu_notte' => array('hex' => '#2E3A8C', 'label' => 'blu notte')
);

$color_data = $color_map[$size_guide_color] ?? $color_map['arancione'];

// Get block attributes
$button_text = $attributes['buttonText'] ?? 'Guida alle taglie';
$button_style = $attributes['buttonStyle'] ?? 'primary';
$show_color = $attributes['showColorIndicator'] ?? true;
$alignment = $attributes['alignment'] ?? 'left';

// Build wrapper classes
$wrapper_classes = array(
    'wp-block-sciuuussize-size-guide-modal',
    'sciuuus-size-guide-wrapper',
    'sciuuus-align-' . esc_attr($alignment)
);

// Get block wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes(array(
    'class' => implode(' ', $wrapper_classes),
    'data-size-guide-color' => esc_attr($size_guide_color)
));

?>
<div <?php echo $wrapper_attributes; ?>>
    <button class="sciuuus-size-guide-button sciuuus-button-<?php echo esc_attr($button_style); ?>" type="button">
        <?php echo esc_html($button_text); ?>
        <?php if ($show_color) : ?>
            <span
                class="sciuuus-color-indicator"
                style="background-color: <?php echo esc_attr($color_data['hex']); ?>;"
                title="<?php echo esc_attr($color_data['label']); ?>"
            ></span>
        <?php endif; ?>
    </button>
</div>
