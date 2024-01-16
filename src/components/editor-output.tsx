import dynamic from "next/dynamic";
import CustomImageRenderer from "./renderers/custom-image-renderer";
import CustomCodeRenderer from "./renderers/custom-code-renderer";

const Output = dynamic(
    async () => (await import('editorjs-react-renderer')).default,
    {
        ssr: false
    }
)

const style = {
    paragraph: {
        fontSize: '0.875rem',
        lineHeight: '1.25rem'
    }
}


const renderers = {
    image: CustomImageRenderer,
    code: CustomCodeRenderer
}

interface EditorOutputProps {
    content: any
}

const EditorOutput = ({ content }: EditorOutputProps) => {
    return (
        <Output
            className="text-sm "
            renderers={renderers}
            style={style}
            data={content}
        />
    );
}

export { EditorOutput };