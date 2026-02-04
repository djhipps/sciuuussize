import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import { select } from '@wordpress/data';
import './editor.css';

export default function Edit({ attributes, setAttributes }) {
    const { buttonText, buttonStyle, showColorIndicator, alignment } = attributes;
    const blockProps = useBlockProps({
        className: `sciuuus-size-guide-alignment-${alignment}`
    });

    // Get current post ID and color from meta (in the editor)
    const postId = select('core/editor')?.getCurrentPostId();
    const postMeta = select('core/editor')?.getEditedPostAttribute('meta');
    const sizeGuideColor = postMeta?._size_guide_color || 'arancione';

    // Color map for display
    const colorMap = {
        'arancione': { hex: '#FC7D06', label: 'arancione' },
        'verde': { hex: '#009285', label: 'verde' },
        'rosso': { hex: '#f40057', label: 'rosso' },
        'giallo': { hex: '#FFD700', label: 'giallo' },
        'blu_notte': { hex: '#2E3A8C', label: 'blu notte' }
    };

    const currentColor = colorMap[sizeGuideColor] || colorMap['arancione'];

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Button Settings', 'sciuuussize')} initialOpen={true}>
                    <TextControl
                        label={__('Button Text', 'sciuuussize')}
                        value={buttonText}
                        onChange={(value) => setAttributes({ buttonText: value })}
                    />
                    <SelectControl
                        label={__('Button Style', 'sciuuussize')}
                        value={buttonStyle}
                        options={[
                            { label: __('Primary', 'sciuuussize'), value: 'primary' },
                            { label: __('Secondary', 'sciuuussize'), value: 'secondary' },
                            { label: __('Outline', 'sciuuussize'), value: 'outline' }
                        ]}
                        onChange={(value) => setAttributes({ buttonStyle: value })}
                    />
                    <ToggleControl
                        label={__('Show Color Indicator', 'sciuuussize')}
                        checked={showColorIndicator}
                        onChange={(value) => setAttributes({ showColorIndicator: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <BlockControls>
                <AlignmentToolbar
                    value={alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
                />
            </BlockControls>

            <div {...blockProps}>
                <div className="sciuuus-size-guide-editor-preview">
                    <button
                        className={`sciuuus-size-guide-button sciuuus-button-${buttonStyle}`}
                        disabled
                    >
                        {buttonText}
                        {showColorIndicator && (
                            <span
                                className="sciuuus-color-indicator"
                                style={{ backgroundColor: currentColor.hex }}
                                title={currentColor.label}
                            />
                        )}
                    </button>
                    <p className="sciuuus-editor-note">
                        {__('Preview - Current guide color: ', 'sciuuussize')}
                        <strong style={{ color: currentColor.hex }}>{currentColor.label}</strong>
                    </p>
                </div>
            </div>
        </>
    );
}
