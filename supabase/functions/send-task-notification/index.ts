
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // Cors headers for cross-origin requests
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
// };

// interface TaskNotificationPayload {
//   taskId: string;
//   eventType: "created" | "completed";
// }

// serve(async (req) => {
//   // Handle CORS preflight requests
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     // Create a Supabase client with the Auth context of the logged in user
//     const supabaseClient = createClient(
//       "https://kihyynlvajbjpmplmhij.supabase.co",
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpaHl5bmx2YWpianBtcGxtaGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM1MTksImV4cCI6MjA2MjYxOTUxOX0.mPSQ6r16uuhIVVu7DRioK3AmUFP9z73pXvvR3f6uVgk",
//       {
//         global: { headers: { Authorization: req.headers.get("Authorization")! } },
//       }
//     );

//     // Get the session to verify the user
//     const {
//       data: { session },
//     } = await supabaseClient.auth.getSession();

//     // If no session or the session doesn't have a user, return unauthorized
//     if (!session || !session.user) {
//       return new Response(
//         JSON.stringify({ error: "Unauthorized" }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Parse the request body
//     const { taskId, eventType }: TaskNotificationPayload = await req.json();
    
//     if (!taskId || !eventType) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Get task details
//     const { data: task, error: taskError } = await supabaseClient
//       .from("tasks")
//       .select("*")
//       .eq("id", taskId)
//       .single();

//     if (taskError || !task) {
//       console.error("Error fetching task:", taskError);
//       return new Response(
//         JSON.stringify({ error: "Task not found" }),
//         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Get client info
//     const { data: client, error: clientError } = await supabaseClient
//       .from("clients")
//       .select("name, email")
//       .eq("id", task.client_id)
//       .single();

//     if (clientError || !client) {
//       console.error("Error fetching client:", clientError);
//       return new Response(
//         JSON.stringify({ error: "Client not found" }),
//         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Get email template
//     const { data: emailTemplate, error: templateError } = await supabaseClient
//       .from("email_settings")
//       .select("subject, template")
//       .eq("type", eventType === "created" ? "task_created" : "task_completed")
//       .single();

//     if (templateError || !emailTemplate) {
//       console.error("Error fetching email template:", templateError);
//       return new Response(
//         JSON.stringify({ error: "Email template not found" }),
//         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Replace placeholders in the template
//     let subject = emailTemplate.subject
//       .replace("{{taskTitle}}", task.title);

//     let htmlContent = emailTemplate.template
//       .replace(/{{clientName}}/g, client.name)
//       .replace(/{{taskTitle}}/g, task.title)
//       .replace(/{{taskDescription}}/g, task.description);

//     if (eventType === "created" && task.due_date) {
//       htmlContent = htmlContent.replace(/{{dueDate}}/g, new Date(task.due_date).toLocaleDateString());
//     } else if (eventType === "completed" && task.completed_at) {
    //   htmlContent = htmlContent.replace(/{{completedDate}}/g, new Date(task.completed_at).toLocaleDateString());
//     }

//     // In a real-world app, you would send an email here using a service like SendGrid, AWS SES, etc.
//     // For now, just log the email that would be sent
//     console.log("Email would be sent to:", client.email);
//     console.log("Subject:", subject);
//     console.log("HTML Content:", htmlContent);

//     // In production, replace this with actual email sending
//     // Example:
//     // await sendEmail(client.email, subject, htmlContent);

//     return new Response(
//       JSON.stringify({ 
//         success: true, 
//         message: `Task notification for ${eventType} event would be sent to ${client.email}` 
//       }),
//       { 
//         status: 200, 
//         headers: { ...corsHeaders, "Content-Type": "application/json" } 
//       }
//     );

//   } catch (error) {
//     console.error("Error in send-task-notification function:", error);
    
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       { 
//         status: 500, 
//         headers: { ...corsHeaders, "Content-Type": "application/json" } 
//       }
//     );
//   }
// });
