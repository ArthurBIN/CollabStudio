import './index.scss'
import {Button} from "antd";
import {useNavigate} from "react-router-dom";
interface Props {
    id: string,
    title: string,
    type: string,
    created_by_email: string,
    updated_at: string
}

interface iconType {
    type: string
}

const Type = (props: iconType) => {
    const { type } = props;

    return (
        <>
            {type === "document" ? (
                <div className={'type_All'} style={{ backgroundColor: "#1677FF" }}>
                    <i className={'iconfont icon-wenjian-L'}></i>
                </div>
            ) : type === "canvas" ? (
                <div className={'type_All'} style={{ backgroundColor: "#8D4BF6" }}>
                    <i className={'iconfont icon-huabi'}></i>
                </div>
            ) : null}
        </>
    );
};

const NoteItem = (props: Props) => {
    const { id, title, type, created_by_email, updated_at } = props
    const navigate = useNavigate()
    const handleTitle = () => {
        if (type === "document") {
            navigate(`/document/${id}`)
        }
    }
    return (
        <div className={'NoteItem'}>
            {/*类型*/}
            <div className={'NoteItem_Type'}>
                <Type type={type} />
            </div>
            {/*标题*/}
            <div className={'NoteItem_Title'}>
                <Button color="primary" variant="link" onClick={handleTitle}>
                    {title}
                </Button>
            </div>
            {/*更新时间*/}
            <div className={'NoteItem_Time'}>
                {new Date(updated_at).toLocaleString()}
            </div>
        </div>
    )
}

export default NoteItem