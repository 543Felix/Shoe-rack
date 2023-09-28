const Product = require('../model/productModel')

const createProduct = (data,images) => {
  
    return new Promise((resolve,reject) =>{
      const newProduct = new Product({
        productName:data.name,
        description:data.description,
        images:images,
        category:data.category,
        price:data.price,
        stock:data.stock
      });
  
      newProduct.save()
        .then(() =>{ 
          resolve() 
        })
        .catch((err) => {
          console.error('Error adding product:', err);
          reject(err)
        });
      });
  
  };

  const updateProduct = async (data, images) => {
    try {
        await Product.findByIdAndUpdate(
          { _id: data.id},
          {
            $set: {
              productName: data.productName,
              description: data.description,
              category: data.category,
              images: images,
              stock:data.stock,
              price: data.price
            }
          }
        );
        // return productData.save()
    } catch (error) {
      console.log(error.message);
    }
  }; 
  const unListProduct = (query) => {
    return new Promise((resolve, reject) => {
      const id = query;
      Product.updateOne({ _id: id }, { isProductListed: false })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };
  

  const reListProduct = (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const id = query;
        const categorylisted = await Product.findOne({ _id: id }).populate('category');
        
        if (categorylisted.category.isListed === true) {
          await Product.updateOne({ _id: id }, { isProductListed: true });
        } else {
          console.log('Cannot Relist');

        }
        
        resolve();
      } catch (error) {
        console.log(error.message);
        reject(error);
      }
    });
  };
  module.exports={
    createProduct,
    updateProduct,
    unListProduct,
    reListProduct
  }
