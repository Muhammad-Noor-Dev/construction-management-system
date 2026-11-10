export default function Empty({ icon: Icon, text }) {
  return <div className="empty">
    <Icon size={30} />
    <span>{text}</span>
  </div>
}
