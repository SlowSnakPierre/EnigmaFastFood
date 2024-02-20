//#region Imports
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
//#endregion

//#region Config
const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//#endregion

app.get("/", (req, res) => {
    res.status(403);
    res.send();
});

//#region Products
app.get("/products", async (req, res) => {
    const { data: products, error } = await supabase.from("products").select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(products);
});

app.get("/products/:id", async (req, res) => {
    const { data: products, error } = await supabase.from("products").select("*").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(products);
});

app.post("/products", async (req, res) => {
    const { data: products, error } = await supabase.from("products").insert([req.body]);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(products);
});

app.put("/products/:id", async (req, res) => {
    const { data: products, error } = await supabase.from("products").update(req.body).eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).send("Successfully Updated");
});

app.delete("/products/:id", async (req, res) => {
    const { data: products, error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).send("Successfully Deleted");
});
//#endregion

//#region Categories
app.get("/categories", async (req, res) => {
    const { data: categories, error } = await supabase.from("categories").select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(categories);
});

app.get("/categories/:id", async (req, res) => {
    const { data: categories, error } = await supabase.from("categories").select("*").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(categories);
});

app.get("/categories/:id/products", async (req, res) => {
    const { data: products, error } = await supabase.from("products").select("*").eq("category_id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(products);
});

app.post("/categories", async (req, res) => {
    const { data: categories, error } = await supabase.from("categories").insert([req.body]);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(categories);
});

app.put("/categories/:id", async (req, res) => {
    const { data: categories, error } = await supabase.from("categories").update(req.body).eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).send("Successfully Updated");
});

app.delete("/categories/:id", async (req, res) => {
    const { data: categories, error } = await supabase.from("categories").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).send("Successfully Deleted");
});
//#endregion

//#region Orders
app.get("/orders", async (req, res) => {
    const { data: orders, error } = await supabase.from("orders").select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ orders });
});

app.get("/orders/:id", async (req, res) => {
    const { data: orders, error } = await supabase.from("orders").select("*").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ orders });
});

app.post("/orders", async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data: orders, error } = await supabase.from("orders").insert([{ ...req.body, user_id: user.id }]);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ orders });
});

app.put("/orders/:id", async (req, res) => {
    // Permission Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data: orders, error } = await supabase.from("orders").select("user_id").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    if (orders[0].user_id !== user.id) return res.status(401).json({ error: "Unauthorized" });

    // Real Update
    const { data: updatedOrders, error: updateError } = await supabase.from("orders").update(req.body).eq("id", req.params.id);
    if (updateError) return res.status(400).json({ error: updateError.message });
    return res.status(200).send("Successfully Updated");
});

app.delete("/orders/:id", async (req, res) => {
    // Permission Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data: orders, error } = await supabase.from("orders").select("user_id").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    if (orders[0].user_id !== user.id) return res.status(401).json({ error: "Unauthorized" });

    // Real Delete
    const { data: deletedOrders, error: deleteError } = await supabase.from("orders").delete().eq("id", req.params.id);
    if (deleteError) return res.status(400).json({ error: deleteError.message });
    return res.status(200).send("Successfully Deleted");
});
//#endregion

//#region Order Items
app.post("/order/:id/add", async (req, res) => {
    // Permission Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data: orders, error } = await supabase.from("orders").select("user_id").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    if (orders[0].user_id !== user.id) return res.status(401).json({ error: "Unauthorized" });

    const { data: orderItems, error: orderItemsError } = await supabase.from("order_items").insert([{ ...req.body, order_id: req.params.id }]).select();
    if (orderItemsError) return res.status(400).json({ error: orderItemsError.message });
    return res.status(200).json(orderItems);
});

app.delete("/order/:id/remove", async (req, res) => {
    // Permission Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data: orders, error } = await supabase.from("orders").select("user_id").eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    if (orders[0].user_id !== user.id) return res.status(401).json({ error: "Unauthorized" });

    const { data: orderItems, error: orderItemsError } = await supabase.from("order_items").delete().eq("id", req.body.id);
    if (orderItemsError) return res.status(400).json({ error: orderItemsError.message });
    return res.status(200).json({ message: "Successfully Deleted" });
});

app.get("/order/:id/items", async (req, res) => {
    const { data: orderItems, error } = await supabase.from("order_items").select("*").eq("order_id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(orderItems);
});
//#endregion

//#region CRUD
app.post("/register", async (req, res) => {
    const { user, error } = await supabase.auth.signUp({
        email: req.body.email,
        password: req.body.password,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Email Sent" });
});

app.post("/login", async (req, res) => {
    const { user, error } = await supabase.auth.signInWithPassword({
        email: req.body.email,
        password: req.body.password,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Logged In" });
});

app.post("/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Logged out" });
});

app.get("/userinfo", async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.status(200).json(user);
});

app.get("/userorders", async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    console.log(user);
    const { data: orders, error } = await supabase.from("orders").select("*").eq("user_id", user.id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(orders);
});
//#endregion

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});