import { Input, DatePicker, Select, Form } from "antd";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuth from "@/api/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { useAuthStore } from "@/store/auth.store";
import { Dayjs } from "dayjs";
import { BookSessionPayload } from "@/lib/types/auth";

type BookSessionFormValues = {
  category?: string;
  reason: string;
  date: Dayjs;
  time: Dayjs;
};

const BookSession = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { useBookSessionMutation } = useAuth();
  const { mutate: bookSession, isPending } = useBookSessionMutation();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (values: BookSessionFormValues) => {
    const userId = Number(user?.id);
    if (!user || Number.isNaN(userId)) {
      toast.error("User session not found. Please login again.");
      return;
    }

    const payload: BookSessionPayload = {
      name: `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),
      email: user.email,
      reason: values.reason,
      date: values.date.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
      userId,
    };

    bookSession(payload, {
      onSuccess: () => {
        toast.success("Session booked successfully.");
        navigate("/onboarding/session-confirmation");
      },
      onError: (error: any) => {
        toast.error(handleApiError(error));
      },
    });
  };

  return (
    <div className="  gap-4 p-4 flex h-[100dvh] flex-col">
      {" "}
      <div className="flex mb-6 iitems-center gap-2">
        <ChevronLeft /> Back
      </div>
      <div className="">
        <h2 className="text-2xl text-[#55288D] font-semibold ">
          Book A Session
        </h2>

        <p className="text-[12px] text-[#1C1C1C] mt-2 ">
          Fill the fields below to book a coaching session.
        </p>
      </div>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="category"
          label="Category"
          className="flex-1 font-medium"
          rules={[{ required: true, message: "Category is required" }]}
        >
          <Select className=" h-[48px]" placeholder="Select a category">
            <Select.Option value="relationship">Relationship</Select.Option>
            <Select.Option value="career">Career</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason for Session"
          className="flex-1 font-medium"
          rules={[{ required: true, message: "Reason is required" }]}
        >
          <Input.TextArea placeholder="Write here" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            name="date"
            label="Date"
            className="flex-1 font-medium"
            rules={[{ required: true, message: "Date is required" }]}
          >
            <DatePicker style={{ width: "100%", height: "48px" }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            className="flex-1 font-medium"
            rules={[{ required: true, message: "Time is required" }]}
          >
            <DatePicker.TimePicker style={{ width: "100%", height: "48px" }} />
          </Form.Item>
        </div>
        <Button
          type="submit"
          className="w-full mt-[50%]"
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </Form>
    </div>
  );
};

export default BookSession;
