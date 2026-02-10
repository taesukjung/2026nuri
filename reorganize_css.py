
import re
import os

def reorganize_css(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    base_styles = []
    media_queries = {
        '1440': [],
        '1024': [],
        '768': [],
        '480': [],
        'other': []
    }
    
    lines = content.split('\n')
    current_block = []
    brace_count = 0
    in_media = False
    
    for line in lines:
        stripped = line.strip()
        
        # Start of a media query
        if not in_media and stripped.startswith('@media'):
            in_media = True
            current_block = [line]
            brace_count = line.count('{') - line.count('}')
            
            # Handle single-line media queries
            if brace_count == 0:
                full_block = '\n'.join(current_block)
                _classify_and_store(full_block, media_queries)
                in_media = False
                current_block = []
            continue
            
        # Inside media query
        if in_media:
            current_block.append(line)
            brace_count += line.count('{') - line.count('}')
            
            if brace_count == 0:
                full_block = '\n'.join(current_block)
                _classify_and_store(full_block, media_queries)
                in_media = False
                current_block = []
            continue
            
        # Not in media query, add to base styles
        base_styles.append(line)

    # Reconstruct content
    new_content = '\n'.join(base_styles).strip() + '\n\n'
    
    sections = [
        ('1440', 'Desktop (max-width: 1440px)'),
        ('1024', 'Tablet (max-width: 1024px)'),
        ('768', 'Mobile (max-width: 768px)'),
        ('480', 'Small Mobile (max-width: 480px)'),
        ('other', 'Other Media Queries')
    ]
    
    for key, title in sections:
        if media_queries[key]:
            new_content += f"/* ===================================\n   {title}\n   =================================== */\n"
            new_content += '\n\n'.join(media_queries[key]) + '\n\n'
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully reorganized {file_path}")

def _classify_and_store(block, media_queries):
    header = block.split('{')[0]
    if '1440' in header:
        media_queries['1440'].append(block)
    elif '1024' in header:
        media_queries['1024'].append(block)
    elif '768' in header:
        media_queries['768'].append(block)
    elif '480' in header:
        media_queries['480'].append(block)
    else:
        media_queries['other'].append(block)

if __name__ == "__main__":
    target_file = r'c:\niswww_test\public\css\sub.css'
    reorganize_css(target_file)
