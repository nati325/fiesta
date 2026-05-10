export default function TestImages() {
    const images = [
        '/invitation-templates/new-tpl-1.jpeg',
        '/invitation-templates/new-tpl-2.jpeg',
        '/invitation-templates/new-tpl-3.jpeg',
        '/invitation-templates/new-tpl-4.jpeg',
        '/invitation-templates/new-tpl-5.jpeg',
        '/invitation-templates/new-tpl-6.jpeg'
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px' }}>
            {images.map((src, i) => (
                <div key={i} style={{ border: '1px solid black', position: 'relative' }}>
                    <h2 style={{ textAlign: 'center' }}>tpl-{i+1}</h2>
                    <img src={src} style={{ width: '100%', display: 'block' }} />
                </div>
            ))}
        </div>
    );
}
