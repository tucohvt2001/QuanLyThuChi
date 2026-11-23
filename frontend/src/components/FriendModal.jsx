import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, FileText, Heart, Briefcase, Users, HelpCircle, Loader2 } from 'lucide-react';
import { AVAILABLE_COLORS } from '../utils/formatters';

export const FriendModal = ({ isOpen, onClose, onSave, editingFriend = null }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('FRIEND');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('#3b82f6');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const relationshipOptions = [
    { id: 'FRIEND', label: 'Bạn bè', icon: Users, color: '#3b82f6' },
    { id: 'COLLEAGUE', label: 'Đồng nghiệp', icon: Briefcase, color: '#8b5cf6' },
    { id: 'FAMILY', label: 'Gia đình', icon: Heart, color: '#10b981' },
    { id: 'OTHER', label: 'Người quen khác', icon: HelpCircle, color: '#64748b' },
  ];

  useEffect(() => {
    if (editingFriend) {
      setName(editingFriend.name || '');
      setRelationship(editingFriend.relationship || 'FRIEND');
      setPhone(editingFriend.phone || '');
      setEmail(editingFriend.email || '');
      setAvatarColor(editingFriend.avatar_color || '#3b82f6');
      setNote(editingFriend.note || '');
    } else {
      setName('');
      setRelationship('FRIEND');
      setPhone('');
      setEmail('');
      setAvatarColor('#3b82f6');
      setNote('');
      setError('');
    }
  }, [editingFriend, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        id: editingFriend?.id,
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim(),
        avatar_color: avatarColor,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu liên hệ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">
            {editingFriend ? 'Chỉnh sửa thông tin bạn bè' : 'Thêm bạn bè / người quen mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Mối quan hệ */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mối quan hệ</label>
            <div className="grid grid-cols-2 gap-2">
              {relationshipOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = relationship === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setRelationship(opt.id);
                      if (!editingFriend) setAvatarColor(opt.color);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tên bạn bè */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Họ và tên *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Tuấn, Chị Lan..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="0912..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email (tùy chọn)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="tuan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Màu sắc avatar */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Màu đại diện</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    avatarColor === c ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú</label>
            <input
              type="text"
              placeholder="VD: Bạn cùng lớp, Trưởng nhóm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                editingFriend ? 'Cập nhật' : 'Thêm bạn bè'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

