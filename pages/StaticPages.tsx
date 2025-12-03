
import React from 'react';
import { ArrowLeft, Shield, FileText, Mail, HelpCircle, Users, CheckCircle } from 'lucide-react';
import { ViewState } from '../types';

interface StaticPageProps {
  page: ViewState;
  onBack: () => void;
}

const StaticPage: React.FC<StaticPageProps> = ({ page, onBack }) => {
  const renderContent = () => {
    switch (page) {
      case ViewState.ABOUT:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center text-white text-4xl font-heading font-bold shadow-lg mb-4">A</div>
              <h1 className="text-3xl font-heading font-bold text-gray-800">Về Asking - Mom & Kids</h1>
              <p className="text-gray-500 mt-2">Đồng hành cùng hàng triệu gia đình Việt</p>
            </div>
            <div className="prose max-w-none text-gray-700">
              <p>Chào mừng bạn đến với <strong>Asking</strong>, nền tảng cộng đồng hàng đầu dành cho cha mẹ và bé tại Việt Nam. Chúng tôi hiểu rằng hành trình nuôi dạy con cái là một chặng đường đầy niềm vui nhưng cũng không ít thử thách.</p>
              <h3 className="text-xl font-bold font-heading text-gray-800 mt-6 mb-3">Sứ mệnh của chúng tôi</h3>
              <p>Sứ mệnh của Asking là kết nối các bậc phụ huynh, tạo ra một không gian an toàn, tin cậy để chia sẻ kiến thức, kinh nghiệm và lan tỏa yêu thương. Chúng tôi tin rằng, mỗi đứa trẻ đều xứng đáng được lớn lên trong sự thấu hiểu và chăm sóc tốt nhất.</p>
              <h3 className="text-xl font-bold font-heading text-gray-800 mt-6 mb-3">Giá trị cốt lõi</h3>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start"><CheckCircle className="text-green-500 mr-2 shrink-0 mt-1" size={18}/> <span><strong>Tin cậy:</strong> Thông tin được kiểm duyệt và hỗ trợ bởi chuyên gia AI.</span></li>
                <li className="flex items-start"><CheckCircle className="text-green-500 mr-2 shrink-0 mt-1" size={18}/> <span><strong>Kết nối:</strong> Xây dựng cộng đồng gắn kết, không phán xét.</span></li>
                <li className="flex items-start"><CheckCircle className="text-green-500 mr-2 shrink-0 mt-1" size={18}/> <span><strong>Sẻ chia:</strong> Nơi mọi câu chuyện đều được lắng nghe.</span></li>
              </ul>
            </div>
          </div>
        );

      case ViewState.TERMS:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <FileText className="text-primary-500 mr-3" size={32} />
              <h1 className="text-2xl font-heading font-bold text-gray-800">Điều khoản sử dụng</h1>
            </div>
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
              <p>Chào mừng bạn đến với Asking. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản sau đây:</p>
              
              <h4 className="font-bold text-gray-900 mt-4">1. Tài khoản người dùng</h4>
              <p>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn là trách nhiệm của bạn.</p>

              <h4 className="font-bold text-gray-900 mt-4">2. Nội dung chia sẻ</h4>
              <p>Người dùng cam kết không đăng tải các nội dung vi phạm pháp luật, thuần phong mỹ tục, thông tin sai lệch hoặc gây thù hằn. Asking có quyền gỡ bỏ bất kỳ nội dung nào vi phạm mà không cần báo trước.</p>

              <h4 className="font-bold text-gray-900 mt-4">3. Quyền sở hữu trí tuệ</h4>
              <p>Nội dung trên Asking (trừ nội dung do người dùng tạo) thuộc sở hữu của Asking. Bạn không được sao chép, sửa đổi hoặc phân phối lại mà không có sự đồng ý.</p>

              <h4 className="font-bold text-gray-900 mt-4">4. Thay đổi điều khoản</h4>
              <p>Chúng tôi có thể cập nhật điều khoản này bất cứ lúc nào. Việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các thay đổi đó.</p>
            </div>
          </div>
        );

      case ViewState.PRIVACY:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Shield className="text-green-600 mr-3" size={32} />
              <h1 className="text-2xl font-heading font-bold text-gray-800">Chính sách bảo mật</h1>
            </div>
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
              <p>Asking cam kết bảo vệ sự riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.</p>

              <h4 className="font-bold text-gray-900 mt-4">1. Thông tin thu thập</h4>
              <p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp (như tên, email khi đăng ký) và thông tin tự động (như địa chỉ IP, cookie).</p>

              <h4 className="font-bold text-gray-900 mt-4">2. Sử dụng thông tin</h4>
              <p>Thông tin của bạn được sử dụng để cung cấp dịch vụ, cá nhân hóa trải nghiệm, gửi thông báo và cải thiện hệ thống.</p>

              <h4 className="font-bold text-gray-900 mt-4">3. Chia sẻ thông tin</h4>
              <p>Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin khi có yêu cầu của pháp luật hoặc để bảo vệ quyền lợi của Asking.</p>

              <h4 className="font-bold text-gray-900 mt-4">4. Bảo mật</h4>
              <p>Chúng tôi áp dụng các biện pháp kỹ thuật tiên tiến để bảo vệ dữ liệu của bạn khỏi truy cập trái phép.</p>
            </div>
          </div>
        );

      case ViewState.CONTACT:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Users className="text-blue-500 mr-3" size={32} />
              <h1 className="text-2xl font-heading font-bold text-gray-800">Liên hệ & Quảng cáo</h1>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
              <h3 className="font-bold text-lg mb-2">Hợp tác cùng Asking</h3>
              <p className="text-gray-600 mb-4">Bạn muốn giới thiệu sản phẩm/dịch vụ chất lượng đến cộng đồng Mẹ & Bé? Hãy liên hệ ngay với chúng tôi.</p>
              <div className="flex items-center text-blue-700 font-bold">
                <Mail className="mr-2" size={20}/> partner@asking.vn
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-800">Thông tin liên hệ</h3>
              <p className="text-gray-600"><strong>Văn phòng:</strong> Tầng 12, Tòa nhà Asking, Hà Nội</p>
              <p className="text-gray-600"><strong>Hotline:</strong> 1900 1234</p>
              <p className="text-gray-600"><strong>Email hỗ trợ:</strong> support@asking.vn</p>
            </div>
          </div>
        );

      case ViewState.SUPPORT:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <HelpCircle className="text-orange-500 mr-3" size={32} />
              <h1 className="text-2xl font-heading font-bold text-gray-800">Trung tâm hỗ trợ</h1>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Làm sao để tích điểm?</h4>
                <p className="text-gray-600 text-sm">Bạn có thể tích điểm bằng cách đăng bài viết mới (+10 điểm), bình luận (+5 điểm), hoặc nhận lượt thích từ người khác (+2 điểm).</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Làm sao để tải tài liệu?</h4>
                <p className="text-gray-600 text-sm">Bạn cần sử dụng điểm tích lũy để tải tài liệu. Mức điểm tùy thuộc vào người đăng quy định (thường là miễn phí hoặc 10-20 điểm).</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2">Quên mật khẩu phải làm sao?</h4>
                <p className="text-gray-600 text-sm">Hãy gửi email đến support@asking.vn với tiêu đề "Quên mật khẩu" kèm theo email đăng ký của bạn để được hỗ trợ.</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-2">Vẫn cần trợ giúp?</p>
              <button className="bg-primary-500 text-white px-6 py-2 rounded-full font-bold hover:bg-primary-600 transition-colors">Gửi yêu cầu hỗ trợ</button>
            </div>
          </div>
        );

      default:
        return <div>Nội dung đang cập nhật...</div>;
    }
  };

  return (
    <div className="animate-fade-in pb-20 lg:pb-0">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[80vh]">
        <div className="p-4 border-b border-gray-100">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-primary-600 transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} className="mr-1" /> Quay lại Trang chủ
          </button>
        </div>
        <div className="p-8 max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
