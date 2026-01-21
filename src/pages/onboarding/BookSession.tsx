import { useState } from "react";
import { Input, DatePicker, Select, Form } from "antd";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BookSession = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    console.log(values);
    // Assuming that session data is being saved or processed.
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
          //   rules={[{ required: true }]}
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
          //   rules={[{ required: true }]}
        >
          <Input.TextArea placeholder="Write here" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            name="date"
            label="Date"
            className="flex-1 font-medium"
            // rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%", height: "48px" }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            className="flex-1 font-medium"
            // rules={[{ required: true }]}
          >
            <DatePicker.TimePicker style={{ width: "100%", height: "48px" }} />
          </Form.Item>
        </div>
 <Link to="/onboarding/session-confirmation">

         <Button className="w-full mt-[50%]">Submit</Button>

 </Link>
      </Form>
    </div>
  );
};

export default BookSession;
