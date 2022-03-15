// JavaScript Documentpackage servlets;
import net.sf.json.JSONObject;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.BasicHttpContext;

import java.io.File;


import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.protocol.HttpContext;



import java.io.IOException;
import org.apache.http.HttpResponse;
import org.apache.http.entity.mime.MultipartEntity;




import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.List;

@WebServlet("/upload_imgs")
public class upload_imgs extends HttpServlet {
    String messageGet;
    String messagePost;
    @Override
    public void init() throws ServletException {
        this.messageGet = "GET......";
        this.messagePost = "POST......";
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }


    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        try {

            //使用Apache文件上传组件处理文件上传步骤：

            //1、创建一个DiskFileItemFactory工厂

            DiskFileItemFactory diskFileItemFactory = new DiskFileItemFactory();

            //2、创建一个文件上传解析器

            ServletFileUpload fileUpload = new ServletFileUpload(diskFileItemFactory);

            //解决上传文件名的中文乱码

            fileUpload.setHeaderEncoding("UTF-8");

            //3、判断提交上来的数据是否是上传表单的数据

            if(!fileUpload.isMultipartContent(request)){

                //按照传统方式获取数据


                return;

            }

            //4、使用ServletFileUpload解析器解析上传数据，解析结果返回的是一个List<FileItem>集合，每一个FileItem对应一个Form表单的输入项

            List<FileItem> list = fileUpload.parseRequest(request);

            for (FileItem item : list) {
                if(item.isFormField()){

                    String name = item.getFieldName();

                    //解决普通输入项的数据的中文乱码问题

                    String value = item.getString("UTF-8");

                    String value1 = new String(name.getBytes("iso8859-1"),"UTF-8");

                    System.out.println(name+" + "+value);
                    System.out.println(name+" + "+value1);

                }else{
                    //如果fileitem中封装的是上传文件，得到上传的文件名称，
                    String fileName = item.getName();
//                    FormatData formatdata = new FormatData();
                    System.out.println("文件名："+fileName);


                    //在这里发送请求吧！

                    System.out.println("正在准备请求数据...");
                    MultipartEntity reqEntity = new MultipartEntity();
                    System.out.println("准备用户权限...");
                    reqEntity.addPart("Authorization", new StringBody("oou8LSutYYXJuyCh8cKrantsb1kCe2FG"));

                    System.out.println("准备文件...");
                    String savePath = this.getServletContext().getRealPath("/img_uploads");
                    System.out.println("准备文件目录完成...");
                    System.out.println(savePath);
                    File file = new File(savePath+File.separator+fileName);
                    System.out.println("预备文件完成...");
                    inputStream2File(item.getInputStream(), file);
                    System.out.println("准备文件完成...");
                    System.out.println(file.getName());
                    reqEntity.addPart("smfile", new FileBody(file));

                    System.out.println("正在发送请求...");

                    String requestUrl = "https://sm.ms/api/v2/upload";
                    HttpPost httpPost = new HttpPost(requestUrl);
                    httpPost.setEntity(reqEntity);

                    HttpClient httpClient = new DefaultHttpClient();
                    HttpContext httpContext = new BasicHttpContext();
                    HttpResponse res = httpClient.execute(httpPost, httpContext);
                    System.out.println("res:");
                    System.out.println(res);
                    System.out.println("serverResponse:");
                    String serverResponse = EntityUtils.toString(res.getEntity());
                    System.out.println(serverResponse);
                    JSONObject resJson = JSONObject.fromObject(serverResponse);
                    String data = resJson.getString("data");
                    JSONObject resdata = JSONObject.fromObject(data);
                    String resurl = resdata.getString("url");
                    System.out.println(resurl);
//                    String redata = "{\"errno\": 0, \"data\": [\n" +
//                            "        {\n" +
//                            "            url: \""+ resurl + "\",\n" +
//                            "        }\n" +
//                            "    ]}";
//                    JSONObject redataJson = JSONObject.fromObject(redata);
//                    System.out.println(redataJson);
                    response.getWriter().write(String.valueOf(resJson));

//                    if(fileName==null||fileName.trim().equals("")){
//
//                        continue;
//
//                    }
                }

            }
        } catch (FileUploadException e) {
            e.printStackTrace();
        }

    }


    @Override
    public void destroy() {
        super.destroy();
    }

    public static void inputStream2File(InputStream is, File file) throws IOException {
        OutputStream os = null;
        try {
            os = new FileOutputStream(file);
            int len = 0;
            byte[] buffer = new byte[8192];

            while ((len = is.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
        } finally {
            os.close();
            is.close();
        }
    }
}